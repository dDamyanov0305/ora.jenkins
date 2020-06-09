const {
    GraphQLObjectType, 
    GraphQLBoolean, 
    GraphQLEnumType, 
    GraphQLList,
    GraphQLString,
    GraphQLID,
    GraphQLSchema

} = require('graphql')

const UserType = new GraphQLObjectType({
    name:'User',
    fields:() => ({
        _id: {type: GraphQLID},
        name: {type:GraphQLString},
        email:{type: GraphQLString},
        password: {type: GraphQLString},
        tokens:{type: new GraphQLList(GraphQLString)},
        create_date:{type, GraphQLString }
    })
})

const WorkspaceType = new GraphQLObjectType({
    name:'User',
    fields:() => ({
        _id: {type: GraphQLID},
        name: {type:GraphQLString},
        assignees:{type:new GraphQLList(UserType)},
        create_date:{type, GraphQLString }
    })
})

const RootQuery = new GraphQLObjectType({
    name:'RootQuery',
    fields:{
        user:{
            type: UserType,
            args:{id:{type: GraphQLID}},
            resolve(parent, args){

            }
        }
    }
})

module.exports = new GraphQLSchema({
    query, RootQuery
})