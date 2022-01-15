

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










get_ver_href_prefix_list();



stg = '## &#x274c; ブランチ名がおかしいです\n';
stg += 'あああ';







