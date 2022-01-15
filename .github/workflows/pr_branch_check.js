module.exports = ({github, context}) => {
    /*
    Pull request ブランチチェックスクリプト

    Pull requestにおいて、以下のブランチチェックを行い、
    不整合があったらエラー送出&プルリクコメントを出します。
    * トピックブランチ(Compare branch)名の整合性チェック
        * ブランチ名が 'PREFIX@NUM' という書式になっているか
            * '@'で分割したときに2要素リストが生成できるか
        * 'PREFIX' 文字が、verif[*].head_ref_prefix に
        定義されているものと一致するか
    * マージ先ブランチ名(Base branch)の整合性チェック
        * 'PREFIX'が一致したvrif[*].base_ref のリストと、
        マージ先ブランチ名が一致するか

    usage
    -----
    このスクリプトはGitHub Actions(actions/github-script@v5)
    を使うことを前提としています。
    また、ワークフロー側でPRイベントをトリガーすることが前提です。
    GitHub Actions外からの呼び出しや、PR以外のイベントトリガーで
    呼び出されると、予期しない挙動になります。
    pr_branch_check.yml も参照して下さい。
    ```

    settings
    --------
    verif には、ブランチ運用実態に合わせてネーミングルールを記述して下さい。
    globとか正規表現みたいなパターンマッチはしていませんが、
    配列でいくつでも定義可能です。

    verif[*].head_ref_prefix
        トピックブランチ側のprefix名。
        '@'より前の名前。
    verif[*].base_ref[*]
        マージ先ブランチ側の名前。
        配列で指定(複数指定可)
    */
    const verif = [
        {
            head_ref_prefix : 'feature',
            base_ref : ['feature']
        },
        {
            head_ref_prefix : 'feature-NewArch',
            base_ref : ['feature-NewArch']
        },
        {
            head_ref_prefix : 'hotfix',
            base_ref : ['hotfix', 'release']
        }
    ];

    // チェック無条件パス ユーザの定義
    // PRイベントトリガーのユーザ名をチェックし、
    // ここに定義したユーザ名と合致する場合は、Passして終了します。
    // (ブランチチェックを行いません)
    const thru_user = ['000'];

    // メッセージ整形用
    var str = '';

    // トピックブランチ名
    const in_head_ref = process.env.GITHUB_HEAD_REF;
    // const in_head_ref = 'hotfix@1234';
    // マージ先ブランチ名
    const in_base_ref = process.env.GITHUB_BASE_REF;
    // const in_base_ref = 'master';
    // プルリクNo
    const pr_number = context.payload.number;
    // Repo owner
    const owner = context.repo.owner;
    // Repo name
    const repo = context.repo.repo;
    // PRイベントトリガーユーザ
    const usr = context.payload.sender.login;

    console.log(
        '*** Pull request ブランチチェック ***\n' + 
        'トピックブランチ : ' + in_head_ref + '\n' +
        'マージ先ブランチ : ' + in_base_ref + '\n' +
        'PR No : ' + pr_number + '\n' +
        'Repository : ' + owner + '/' + repo + ''
    )

    if (thru_user.includes(usr)) {
        console.log('このPRイベントは \'' + usr + '\' によってトリガーされました。')
        console.log('チェックスルー対象ユーザのため、ブランチチェックはパスします。')
        return;
    }

    // '@'で分割
    const li = in_head_ref.split('@');
    if (li.length != 2) {
        str = '## &#x274c; トピックブランチ(Compare branch)の名前が不正です\n';
        str += 'トピックブランチ名 `' + in_head_ref + '` は、想定された名前ではありません。\n';
        str += '下記の命名ルールを確認して下さい。\n';
        str += '* トピックブランチ名は `PREFIX@NUM` という書式であること\n';
        str += '  * `PREFIX` は ' + verif.map(t => '`'+t.head_ref_prefix+'`').join(', ') +' のいずれかであること\n';
        str += '  * `NUM` は、このトピックブランチに紐付くRedmineチケットの番号であること\n(チケット未起票のPRは認めません)';
        // PRにエラーコメント投げる
        github.rest.issues.createComment({
            issue_number: pr_number,
            owner: owner,
            repo: repo,
            body: str
        })
        // Error送出
        str = 'トピックブランチ名解析に失敗しました。';
        str += 'トピックブランチ名 \'' + in_head_ref + '\' を';
        str += '\'@\'分割した結果、要素数が ' + li.length + ' でした。';
        str += '(2でなければいけません)';
        throw str;
    }
    // トピックブランチ プレフィックス名
    const in_head_ref_prefix = li[0];

    // トピックブランチ プレフィックス名が
    // 定義リストにあるか検索
    const verif_base_ref = verify_head_ref(verif, in_head_ref_prefix);
    if (!verif_base_ref.length) {
        str = '## &#x274c; トピックブランチ(Compare branch)の名前が不正です\n';
        str += 'トピックブランチ名 `' + in_head_ref + '` は、想定された名前ではありません。\n';
        str += '下記の命名ルールを確認して下さい。\n';
        str += '* トピックブランチ名は `PREFIX@NUM` という書式であること\n';
        str += '  * `PREFIX` は ' + verif.map(t => '`'+t.head_ref_prefix+'`').join(', ') +' のいずれかであること\nß';
        str += '  * `NUM` は、このトピックブランチに紐付くRedmineチケットの番号であること\n(チケット未起票のPRは認めません)';
        // PRにエラーコメント投げる
        github.rest.issues.createComment({
            issue_number: pr_number,
            owner: owner,
            repo: repo,
            body: str
        })
        // Error送出
        str = 'トピックブランチ名解析に失敗しました。';
        str += 'トピックブランチ プレフィックス名 \'' + in_head_ref_prefix + '\' が';
        str += '定義リストにありません。';
        throw str;
    } else {
        console.log('トピックブランチ名解析 OK')
    }
    
    // ベースブランチ名の検索
    if (!verif_base_ref.includes(in_base_ref)) {
        str = '## &#x274c; マージ先ブランチ(Base branch)が違います\n';
        str += '現在、マージ先ブランチ名が `'+ in_base_ref +'` に設定されています。\n';
        str += 'このPRのトピックブランチ名は `'+ in_head_ref +'` なので、';
        str += 'マージ先ブランチ名は '+ verif_base_ref.map(t => '`'+t+'`').join(' or ') +' でなければいけません。\n';
        // PRにエラーコメント投げる
        github.rest.issues.createComment({
            issue_number: pr_number,
            owner: owner,
            repo: repo,
            body: str
        })
        // Error送出
        str = 'マージ先ブランチ(Base branch)が違います。';
        str += '現在、マージ先ブランチ名が \'' + in_base_ref + '\' に設定されています。';
        str += 'このPRのトピックブランチ名は \'' + in_head_ref + '\' なので、';
        str += 'マージ先ブランチ名は ' + verif_base_ref.map(t => '\''+t+'\'').join(' or ') + ' でなければいけません。';
        throw str;
    } else {
        console.log('マージ先ブランチ名Check OK')
    }

}


// トピックブランチ プレフィックス名の検索
function verify_head_ref(verif, in_head_ref_prefix) {
    /*
     * トピックブランチ プレフィックス名が、
     * 定義リストに存在するかどうかを検証します。
     * 
     * 定義リストに存在する場合は、マージ先ブランチ(Base branch)の
     * 定義リストを返します。
     * 定義リストに存在しない場合は、空のリストを返します。
    */
    var bref_list =[];
    for (const v of verif) {
        if (in_head_ref_prefix === v.head_ref_prefix) {
            // オブジェクトから base_refリストを抜き取る
            bref_list = v.base_ref;
        }
    }
    return bref_list
}
