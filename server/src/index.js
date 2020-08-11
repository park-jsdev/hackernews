// More info on GraphQL schema: https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e

// We need to set up server to access db queries with new Prismal Client exposes
const { PrismaClient } = require('@prisma/client')
// Using graphql-yoga, a fully-featured GraphQL server. It is based on Express.js
const { GraphQLServer } = require('graphql-yoga')
// Save an instance of PrismaClient to a variable 
const prisma = new PrismaClient()
// use resolver implementations
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')
const Subscription = require('./resolvers/Subscription')
const Vote = require('./resolvers/Vote')
// set up subscriptions using PubSub
const { PubSub } = require('graphql-yoga')
const pubsub = new PubSub()


// defines the GraphQL schema. Here, defines a simple Query type with one field called info.
// We use schema-driven aka schema-first development (extend schema definition with a new root field and implement
// corresponding resolver functions for added fields)
// This field has the type String!. Exclamation means this field is required and can never be null.
// we refactored the schema definition and moved to its own file
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    prisma,
  }
})

// The links variable is used to store the links at runtime. For now, everything is stored only in-memory rather than being persisted in a database.
let links = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]

// The resolvers object is the actual implementation of the GraphQL schema.
// Link resolvers are not needed because GraphQL server infers what they look like
// Adding a new int variable that serves as a very rudimentary way to generate unique IDs for newly created Link elements
// To summarize: Prisma Client exposes a CRUD API for the models in your datamodel for you to read and write in your database.
// These methods are auto-generated based on your model definitions in schema.prisma.
let idCount = links.length
const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote,
}
// Finally, the schema and resolvers are bundled and passed to the GraphQLServer 
// which is imported from graphql-yoga. This tells the server what API operations are accepted and how they should be resolved.
const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: request => {
    return {
      ...request,
      prisma,
    }
  },
})
server.start(() => console.log(`Server is running on http://localhost:4000`))