Jazzyyy UNO
===========

This project can run with or without MongoDB.

When `MONGO_URI` is configured and MongoDB is available, games are saved in
MongoDB. When `MONGO_URI` is missing or MongoDB cannot be reached, the server
starts with in-memory game storage instead.

In-memory mode is useful for local play, but games are lost when the server
restarts.
