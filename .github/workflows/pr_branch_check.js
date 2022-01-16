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
      * 'PREFIX'と一致したvrif[*].base_ref のリストと、
        マージ先ブランチ名が一致するか


    usage
    -----
    このスクリプトはGitHub Actions(actions/github-script@v5)
    を使うことを前提としています。
    また、ワークフロー側でPRイベントをトリガーすることが前提です。
    GitHub Actions外からの呼び出しや、PR以外のイベントトリガーで
    呼び出されると、予期しない挙動になります。
    pr_branch_check.yml も参照して下さい。

    
    Definition of branch
    --------------------

    o    <== approved PR commit (merged into base branch)
    |\ 
    | o  <== pull_request target commit (right branch)
    o    <== merge base commit (left branch)

    * 左側のブランチ(into)
      * Base branch
      * マージ先ブランチ
    * 右側のブランチ(from)
      * Compare branch
      * HEAD branch
      * トピックブランチ
      * プルリク対象のブランチ
    

    settings
    --------
    verif には、ブランチ運用実態に合わせてネーミングルールを記述して下さい。
    配列でいくつでも定義可能です。

    verif[*].head_ref_prefix : string
        トピックブランチ側のprefix名。
        '@'より前の名前。
        トピックブランチ プレフィックス名は、完全一致を要求します。
    verif[*].base_ref[*] : Array[RegExp]
        マージ先ブランチ側の名前。
        配列で指定(複数指定可)
        マージ先ブランチ名は、正規表現一致を要求します。
        配列のどれか一つでも正規表現一致したらパスします。
    */
    const verif = [
        {
            head_ref_prefix : 'feature',
            base_ref : [
                /^feature$/, 
                /^feature@[0-9]+$/
            ]
        },
        {
            head_ref_prefix : 'feature-NewArch',
            base_ref : [
                /^feature-NewArch$/,
                /^feature-NewArch@[0-9]+$/
            ]
        },
        {
            head_ref_prefix : 'hotfix',
            base_ref : [
                /^hotfix$/,
                /^hotfix@[0-9]+$/,
                /^release$/
            ]
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
    // Actions run No
    const run_number = context.runNumber;
    // Actions run ID
    const run_id = context.runId;

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
        str += '  * `NUM` は、このトピックブランチに紐付くRedmineチケットの番号であること\n(チケット未起票のPRは認めません)\n';
        str += '\n';
        str += '[Action #'+ run_number +'](https://github.com/'+ owner +'/'+ repo +'/actions/runs/'+ run_id +')\n';

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
        str += '\n';
        str += '[Action #'+ run_number +'](https://github.com/'+ owner +'/'+ repo +'/actions/runs/'+ run_id +')\n';
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
    if (!verif_base_ref.some(r => r.test(in_base_ref))) {
        str = '## &#x274c; マージ先ブランチ(Base branch)が違います\n';
        str += '現在、マージ先ブランチ名が `'+ in_base_ref +'` に設定されています。\n';
        str += 'このPRのトピックブランチ名は `'+ in_head_ref +'` なので、';
        str += 'マージ先ブランチ名は '+ verif_base_ref.map(t => '`'+t+'`').join(' or ') +' でなければいけません。\n';
        str += '\n';
        str += '[Action #'+ run_number +'](https://github.com/'+ owner +'/'+ repo +'/actions/runs/'+ run_id +')\n';
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
