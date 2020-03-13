if (process.env.NODE_ENV == "production") {
  module.exports = {mongoURI: "mongodb+srv://rcosta96:IdOUryriYOi2UhBE@main-cluster-x8hgm.mongodb.net/test?retryWrites=true&w=majority"}
}else{
  module.exports = {mongoURI: "mongodb://localhost/sistemausers"}
}
