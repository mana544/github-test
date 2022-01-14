
/*
head_ref_prefix
    トピックブランチ側のprefix名。
    '@'より前の名前。
base_ref
    マージ先ブランチ側の名前。
    配列で指定(複数指定可)
*/
const o = [
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


stg = '## &#x274c; ブランチ名がおかしいです\n';
stg += 'あああ';

console.log(stg);






