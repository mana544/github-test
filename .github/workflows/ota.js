module.exports = ({github, context}) => {
    console.log(context.payload.number)
    console.log(process.env)
}