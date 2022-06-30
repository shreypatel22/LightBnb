const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');
const { user } = require('pg/lib/defaults');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
  .query(`SELECT * FROM users WHERE email = $1;`, [email])
  .then((result) => {
    console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });

}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
  .query(`SELECT * FROM users WHERE id = $1;`, [id])
  .then((result) => {
    // console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool
  .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, [user.name, user.email, user.password])
  .then((result) => {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
  .query(`SELECT properties.thumbnail_photo_url, properties.parking_spaces, properties.number_of_bathrooms, properties.number_of_bedrooms, reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;
  `, [guest_id, limit])
  .then((result) => {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  // const limited = 10;

  // return pool
  //   .query(`SELECT properties.*, avg(property_reviews.rating) as average_rating
  //   FROM properties
  //   JOIN property_reviews ON properties.id = property_id
  //   WHERE city LIKE '%ancouv%'
  //   GROUP BY properties.id
  //   HAVING avg(property_reviews.rating) >= 4
  //   ORDER BY cost_per_night
  //   LIMIT $1;`, [limit])
  //   .then((result) => {
  //     console.log(result.rows);
  //     return result.rows;
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //   });

  // ------------------------------------------------------------
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  let combineString = '';
  
  // CITY
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    combineString += `AND city LIKE $${queryParams.length} `;
  }
  
  // OWNER ID
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    combineString += `AND owner_id = $${queryParams.length} `;
  }

  // MIN PRICE
  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    combineString += `AND cost_per_night > $${queryParams.length} `;
  }

  // MAX PRICE
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);
    combineString += `AND cost_per_night < $${queryParams.length} `;
  }

  // MIN RATING
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    combineString += `AND property_reviews.rating > $${queryParams.length} `;
  }

  if (combineString !== '') {
    queryString += 'WHERE 1 = 1 ';
    queryString += combineString;
  }


  //4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);

};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
