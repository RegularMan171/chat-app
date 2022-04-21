const generateMsg = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateLoc = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMsg,
    generateLoc
}