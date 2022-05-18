const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    return blogs.reduce((partialSum, blog) => partialSum + blog.likes, 0)
}
  
module.exports = {
    dummy,
    totalLikes
  }

