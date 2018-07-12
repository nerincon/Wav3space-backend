if (process.env.NODE_ENV === 'production') {
  module.exports = `postgres://addfccnxqqycer:2d32d95b95b1975376b2c770e8da5a3e453ae8a2ac156d1afdcf46253de23341@ec2-107-22-169-45.compute-1.amazonaws.com:5432/d2njaiearc98ng
    `
} else {
  module.exports = {database: 'wav3space', user: 'postgres'}
}
