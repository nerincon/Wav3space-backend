if (process.env.NODE_ENV === 'production') {
  module.exports = `postgres://pswbzunrfeewcj:6b93b542c2c95f0c3560410c25c1f9b7e2f4794c610c12ced8193d436385c06b@ec2-54-235-66-24.compute-1.amazonaws.com:5432/dc4g6dnv27e92p`
} else {
  module.exports = {database: 'wav3space', user: 'postgres'}
}
