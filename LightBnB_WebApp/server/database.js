const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  const queryString = `SELECT * FROM users
  WHERE email = $1;`;
  const queryParams = [email.toLowerCase()];

  return pool.query (
    queryString, queryParams
  )
  .then(res => res.rows[0])
  .catch(err => console.log(err.message))
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const queryString = `SELECT * FROM users
  WHERE id = $1;`;
  const queryParams = [id];

  return pool.query (
    queryString, queryParams)
  .then(res => res.rows[0])
  .catch(err => console.log(err.message))
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const queryString = `
  INSERT INTO users (name, email, password)
  queryParams ($1, $2, $3) RETURNING *;`;
  const queryParams = [user.name, user.email, user.password];

  return pool.query (
    queryString, queryParams)
  .then(res => res.rows[0])
  .catch(err => console.log(err.message))
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `
  SELECT * FROM reservations
  JOIN properties ON property_id = properties.id
  WHERE guest_id = $1
  LIMIT $2;`;
  const queryParams = [guest_id, limit];

  return pool.query (
    queryString, queryParams)
  .then(res => res.rows)
  .catch(err => console.log(err.message))
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
 const getAllProperties = function (options, limit = 10) {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1 
  `;
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city LIKE $${queryParams.length}`;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `AND owner_id = $${queryParams.length}`;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night*100);
    queryString += `AND cost_per_night >= $${queryParams.length}`;
  }
  
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night*100);
    queryString += `AND cost_per_night <= $${queryParams.length}`;
  }
  
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `AND rating >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return pool.query(queryString, queryParams)
  .then((res) => res.rows)
  .catch((err) => console.log(err.message));
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;