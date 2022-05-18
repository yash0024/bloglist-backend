const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const listHelper = require('../utils/list_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const { json } = require('express')

jest.setTimeout(100000)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.blogs)
  })

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(helper.blogs.length)
  })

test('every blog has an id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    blogsAtStart.forEach(blog => {
        expect(blog.id).toBeDefined()
    })
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: "Group Theory",
        author: "Yash",
        url: "yash.com",
        likes: 48
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.blogs.length + 1)
})

test('likes default to 0', async () => {
    const newBlog = {
        title: "Galois Theory",
        author: "Yash",
        url: "yash.com"
    }

    await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.blogs.length + 1)

    expect(listHelper.totalLikes(blogsAtEnd)).toEqual(listHelper.totalLikes(helper.blogs))
})

test('deletion of a blog succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.blogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
})

test('updating likes works correctly', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const updatedBlog = blogsAtStart[0]

    updatedBlog.likes = blogsAtStart[0].likes + 4

    await api
        .put(`/api/blogs/${updatedBlog.id}`)
        .send(updatedBlog)
        .expect(204)
})

afterAll(() => {
    mongoose.connection.close()
  }) 