module.exports = ({github, context, env}) => {
    context.payload.client_payload.value

    // トピックブランチ名
    const in_head_ref = env.GITHUB_HEAD_REF;
    // マージ先ブランチ名
    const in_base_ref = env.GITHUB_BASE_REF;
    // プルリクNo
    const pr_number = context.payload.number;
    // owner
    const owner = context.repo.owner;
    // repo
    const repo = context.repo.repo;

    console.log(
        '*** Pull request ブランチチェック ***\n' + 
        'トピックブランチ : ' + in_head_ref + '\n' +
        'マージ先ブランチ : ' + in_base_ref + '\n' +
        'PR No : ' + pr_number + '\n' +
        'Repo Owner : ' + owner + '\n' +
        'Repo Name : ' + repo + ''
    )

}

