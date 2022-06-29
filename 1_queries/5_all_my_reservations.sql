-- SELECT reservations.id, properties.title, reservations.start_date, properties.cost_per_night, avg(rating)
-- FROM users
-- JOIN properties ON owner_id = users.id
-- JOIN reservations ON reservations.guest_id = users.id
-- JOIN property_reviews ON  property_reviews.guest_id = users.id
-- WHERE users.email = 'tristanjacobs@gmail.com'
-- GROUP BY properties.id;

SELECT reservations.id, properties.title, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;