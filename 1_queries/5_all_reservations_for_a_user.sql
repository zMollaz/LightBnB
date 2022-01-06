SELECT reservations.*, properties.*,
avg(property_reviews.rating) as average_rating
FROM properties
JOIN reservations ON reservations.property_id = properties.id
JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE reservations.guest_id = 1
GROUP BY reservations.id, properties.id
HAVING reservations.end_date < now()::date
ORDER BY reservations.start_date ASC
LIMIT 10;