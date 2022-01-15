
/*
head_ref_prefix
    トピックブランチ側のprefix名。
    '@'より前の名前。
base_ref
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

/*
トピックブランチ名解析に失敗しました
    セパレート文字列が見つかりませんでした
    プレフィックス解析ができませんでした
    プレフィックス名が空です
    プレフィックス名が定義リストにない

## &#x274c; トピックブランチ(Compare branch)の名前が不正です
トピックブランチ名 `Hohex@0000` は、想定された名前ではありません。
下記の命名ルールを確認して下さい。
* トピックブランチ名は `PREFIX@NUM` という書式であること
  * `PREFIX` は `feature`, `feature-NewArch`, `hotfix` の
    いずれかであること
  * `NUM` は、このトピックブランチに紐付くRedmineチケットの番号であること
    (チケット未起票のPRは認めません)

## &#x274c; マージ先ブランチ(Base branch)が違います
現在、マージ先ブランチ名が `master` に設定されています。
このPRのトピックブランチ名は `hotfix@0000` なので、
マージ先ブランチ名は `release`, `hotfix` でなければいけません。

*/

// トピックブランチ名
const in_head_ref = 'hotfix@1234';
// マージ先ブランチ名
const in_base_ref = 'release';
// プルリクNo
const pr_number
// owner
const owner
// repo
const repo

function get_ver_href_prefix_list() {
    // head_refプレフィックス名定義リストを返す
    const li = verif.map(t => t.head_ref_prefix);
    console.log(li)
}

// トピックブランチ プレフィックス名の検索
function verify_head_ref(in_head_ref_prefix) {
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






console.log(
    '*** Pull request ブランチチェック ***\n' + 
    'トピックブランチ : ' + in_head_ref + '\n' +
    'マージ先ブランチ : ' + in_base_ref + ''
)

// '@'で分割
const li = in_head_ref.split('@');
if (li.length != 2) {
    // Error送出
    str = 'トピックブランチ名解析に失敗しました。\n';
    str += 'トピックブランチ名 \'' + in_head_ref + '\' を';
    str += '\'@\'分割した結果、要素数が ' + li.length + ' でした。';
    str += '(2でなければいけません)';
    throw str;
}
// トピックブランチ プレフィックス名
const in_head_ref_prefix = li[0];

// トピックブランチ プレフィックス名の検索
const verif_base_ref = verify_head_ref(in_head_ref_prefix);
if (!verif_base_ref.length) {
    // Error送出
    str = 'トピックブランチ名解析に失敗しました。\n';
    str += 'トピックブランチ プレフィックス名 \'' + in_head_ref_prefix + '\' が';
    str += '定義リストにありません。';
    throw str;
} else {
    console.log('トピックブランチ名解析 OK')
}

// ベースブランチ名の検索
if (!verif_base_ref.includes(in_base_ref)) {
    // Error送出
    str = 'マージ先ブランチ(Base branch)が違います\n';
    str += '現在、マージ先ブランチ名が \'' + in_base_ref + '\' に設定されています。';
    str += 'このPRのトピックブランチ名は \'' + in_head_ref + '\' なので、';
    str += 'マージ先ブランチ名は ' + verif_base_ref.map(t => '\''+t+'\'').join(' or ') + ' でなければいけません。';
    throw str;
} else {
    console.log('マージ先ブランチ名Check OK')
}

get_ver_href_prefix_list();



stg = '## &#x274c; ブランチ名がおかしいです\n';
stg += 'あああ';







