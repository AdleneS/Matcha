const pool = require("./db");
var bcrypt = require("bcrypt");
var moment = require("moment");
var genderOrientation = require("./enum/genderOrientation.js");
const { isElement } = require("react-dom/test-utils");

const getUsers = (request, response) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    } else {
      response.status(200).json(results.rows);
    }
  });
};

const getUsersByUid = (request, response) => {
  pool.query(
    "SELECT users.id, email, firstname, gender, popularity, sexual_orientation, name, login, gender, description, birthday, country, array_agg(tag.tag) as tag FROM users LEFT JOIN tag ON tag.uid = users.uid WHERE users.uid = $1 GROUP BY users.id",
    [request.signedCookies.info.uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        response.status(200).json(results.rows);
      }
    }
  );
};

const getUsersInfo = (uid) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT users.id, users.uid, email, firstname, gender, popularity, sexual_orientation, name, login, description, country, connected, array_agg(tag.tag) as tag FROM users LEFT JOIN tag ON tag.uid = users.uid  WHERE users.uid = $1 GROUP BY users.id",
      [uid],
      (error, results) => {
        if (error) {
          throw error;
        } else {
          resolve(results.rows[0]);
        }
      }
    );
  });
};

const getUsersImg = async (request, response) => {
  const user = await getUsersInfo(request.signedCookies.info.uid);
  let pretenders = null;
  pool.query(
    "SELECT users.id, users.uid, birthday, email, firstname, gender, popularity, sexual_orientation, name, array_agg(tag.tag) as tag,\
     login, description, country, connected, path, img.n_pic \
     FROM users \
     LEFT JOIN img ON users.uid = img.uid\
     LEFT JOIN tag ON tag.uid = users.uid\
       WHERE NOT users.uid = $1 AND (img.n_pic = 1 OR img.n_pic IS NULL)\
       GROUP BY users.id, users.uid, img.path, img.n_pic ORDER BY users.country <> $4, users.popularity DESC LIMIT $2 OFFSET $3",
    [request.signedCookies.info.uid, request.params.limit, request.params.offset, user.country],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        pretenders = results.rows;
        if (
          user.sexual_orientation === genderOrientation.orientation.bi ||
          user.gender === genderOrientation.gender.other
        ) {
          pretenders = pretenders;
        } else if (user.gender === genderOrientation.gender.man) {
          if (user.sexual_orientation === genderOrientation.orientation.hetero) {
            pretenders = pretenders.filter(
              (pretender) =>
                (pretender.gender === genderOrientation.gender.woman ||
                  pretender.gender === genderOrientation.gender.other) &&
                (pretender.sexual_orientation === genderOrientation.orientation.hetero ||
                  pretender.sexual_orientation === genderOrientation.orientation.bi)
            );
          } else if (user.sexual_orientation === genderOrientation.orientation.homo) {
            pretenders = pretenders.filter(
              (pretender) =>
                (pretender.gender === genderOrientation.gender.man ||
                  pretender.gender === genderOrientation.gender.other) &&
                (pretender.sexual_orientation === genderOrientation.orientation.homo ||
                  pretender.sexual_orientation === genderOrientation.orientation.bi)
            );
          }
        } else if (user.gender === genderOrientation.gender.woman) {
          if (user.sexual_orientation === genderOrientation.orientation.hetero) {
            pretenders = pretenders.filter(
              (pretender) =>
                (pretender.gender === genderOrientation.gender.man ||
                  pretender.gender === genderOrientation.gender.other) &&
                (pretender.sexual_orientation === genderOrientation.orientation.hetero ||
                  pretender.sexual_orientation === genderOrientation.orientation.bi)
            );
          } else if (user.sexual_orientation === genderOrientation.orientation.homo) {
            pretenders = pretenders.filter(
              (pretender) =>
                (pretender.gender === genderOrientation.gender.woman ||
                  pretender.gender === genderOrientation.gender.other) &&
                (pretender.sexual_orientation === genderOrientation.orientation.homo ||
                  pretender.sexual_orientation === genderOrientation.orientation.bi)
            );
          }
          pretenders.forEach((a, i) => {
            var tagCommun = 0;
            user.tag.forEach((tag) => {
              if (a.tag.includes(tag)) {
                tagCommun++;
              }
            });
            if (tagCommun > 0) {
              pretenders.splice(i, 1);
              pretenders.unshift(a);
            }
          });
        }
        if (results.rows.length) {
          response.status(200).json(pretenders);
        } else {
          response.status(401).json(pretenders);
        }
      }
    }
  );
};

const postSearch = async (request, response) => {
  const { gender, sexual_orientation, age, popularity, country, tag } = request.body;
  let filterSearch = null;
  pool.query(
    "SELECT users.id, users.uid, birthday, email, firstname, gender, popularity, sexual_orientation, name, login, description, country, connected, array_agg(img.path) as path, array_agg(tag.tag) as tag FROM users LEFT JOIN img ON img.uid = users.uid LEFT JOIN tag ON tag.uid = users.uid WHERE NOT users.uid = $1 GROUP BY users.id LIMIT $2 OFFSET $3 ",
    [request.signedCookies.info.uid, request.params.limit, request.params.offset],
    async (error, results) => {
      if (error) {
        throw error;
      } else {
        filterSearch = results.rows;
        if (gender) {
          filterSearch = await filterSearch.filter((pretender) => pretender.gender === gender);
        }
        if (sexual_orientation) {
          filterSearch = await filterSearch.filter((pretender) => pretender.sexual_orientation === sexual_orientation);
        }
        if (country) {
          filterSearch = await filterSearch.filter((pretender) =>
            pretender.country
              .toLocaleLowerCase("en-US")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes(
                country
                  .toLocaleLowerCase("en-US")
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
              )
          );
        }
        if (popularity) {
          filterSearch = await filterSearch.filter(
            (pretender) => pretender.popularity >= popularity[0] && pretender.popularity <= popularity[1]
          );
        }
        if (age) {
          filterSearch = await filterSearch.filter(
            (pretender) =>
              moment().diff(pretender.birthday, "years") >= age[0] &&
              moment().diff(pretender.birthday, "years") <= age[1]
          );
        }
        if (tag && tag.length && tag[0] !== "") {
          filterSearch = await filterSearch.filter((pretender) => {
            return pretender.tag.some((ptag) => tag.includes(ptag));
          });
        }
      }
      if (results.rows.length) {
        response.status(200).json(filterSearch);
      } else {
        response.status(403).json(filterSearch);
      }
    }
  );
};

const getLikes = (request, response) => {
  pool.query("SELECT * FROM likes WHERE uid_liker = $1", [request.signedCookies.info.uid], (error, results) => {
    if (error) {
      throw error;
    } else {
      response.status(200).json(results.rows);
    }
  });
};

const checkPic = (request, response) => {
  pool.query("SELECT * FROM img WHERE uid = $1", [request.signedCookies.info.uid], (error, results) => {
    if (error) {
      throw error;
    } else {
      if (results.rows.length) {
        response.status(200).json();
      } else {
        response.status(403).json();
      }
    }
  });
};

const getNotif = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  pool.query(
    "SELECT * FROM notifications WHERE notified_uid = $1 ORDER BY id DESC LIMIT 10",
    [user_uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        response.status(200).json(results.rows);
      }
    }
  );
};
const getNotifNb = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  pool.query("SELECT * FROM notifications WHERE notified_uid = $1 AND seen = false", [user_uid], (error, results) => {
    if (error) {
      throw error;
    } else {
      response.status(200).json(results.rowCount);
    }
  });
};
const setNotifSeen = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  pool.query(
    "UPDATE notifications SET seen = true WHERE notified_uid = $1 AND seen = false",
    [user_uid],
    (error, results) => {
      if (error) throw error;
      else response.status(200).json({ info: results.rowCount });
    }
  );
};

const setConnected = (uid) => {
  pool.query("UPDATE users SET connected = true WHERE uid = $1 AND connected = false", [uid], (error, results) => {
    if (error) throw error;
    else return "connected";
  });
};

const setDisconnected = (uid) => {
  pool.query("UPDATE users SET connected = false WHERE uid = $1 AND connected = true", [uid], (error, results) => {
    if (error) throw error;
    else return "disconnected";
  });
};

const updateLocation = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  pool.query("UPDATE users SET country = $2 WHERE uid = $1", [user_uid, request.body.location], (error, results) => {
    if (error) {
      throw error;
    } else {
      response.status(200).json({ info: "Location Modified" });
    }
  });
};

const getUserById = (request, response) => {
  const id = parseInt(request.params.id);
  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    } else {
      response.status(200).json(results.rows);
    }
  });
};

const getUserByEmail = (request, response) => {
  const email = request.params.id;
  pool.query("SELECT * FROM users WHERE email = $1", [email], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createUser = (request, response) => {
  const { login, email, password, birthday, gender, sexual_orientation } = request.body;
  pool.query(
    "INSERT INTO users (login, email, password, date, birthday, gender, sexual_orientation) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      login,
      email,
      bcrypt.hashSync(password, 10),
      moment().format("YYYY/MM/DD"),
      moment(birthday, "YYYY/MM/DD"),
      gender.toLowerCase(),
      sexual_orientation.toLowerCase(),
    ],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User added with ID: ${login}`);
    }
  );
};

const createNotif = async (request, response) => {
  const user = await getUsersInfo(request.signedCookies.info.uid);
  const { notified_uid, notif_type } = request.body;
  pool.query(
    "INSERT INTO notifications (notified_uid, notifier_uid, notifier_login, notif_type, date) VALUES ($1, $2, $3, $4, $5)",
    [notified_uid, user.uid, user.login, notif_type, moment().format("YYYY/MM/DD")],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        response.status(200).json({ message: "New Notif" });
      }
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

const createMatch = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  const pretender_uid = request.body.pretenderUid;
  pool.query(
    "SELECT * FROM likes WHERE uid_liker = $1 AND uid_liked = $2",
    [pretender_uid, user_uid],
    (error, results) => {
      if (error) {
        response.json({ error: "Bad Request" }).status(400);
      } else if (results.rows.length) {
        pool.query(
          "INSERT INTO match (uid_1, uid_2, date) VALUES ($1, $2, $3)",
          [user_uid, pretender_uid, moment().format("LLL")],
          (error, results) => {
            if (error) {
              throw error;
            }
            response.json({ info: "match" }).status(200);
          }
        );
      } else {
        response.json({ info: "nothing" }).status(200);
      }
    }
  );
};

const deleteMatch = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  const pretender_uid = request.body.pretenderUid;
  pool.query(
    "SELECT * FROM match WHERE uid_1 = $1 AND uid_2 = $2 OR uid_1 = $2 AND uid_2 = $1",
    [user_uid, pretender_uid],
    (error, results) => {
      if (error) {
        throw error;
      } else if (results.rows.length) {
        pool.query(
          "DELETE FROM match WHERE uid_1 = $1 AND uid_2 = $2 OR uid_1 = $2 AND uid_2 = $1",
          [user_uid, pretender_uid],
          (error, results) => {
            if (error) {
              throw error;
            }
            response.json({ info: "unmatch" }).status(200);
          }
        );
      } else {
        response.json({ info: "nothing" }).status(200);
      }
    }
  );
};
const getMatch = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  pool.query(
    "SELECT a.firstname, a.gender, a.popularity, a.sexual_orientation, a.name, a.login, a.connected ,b.*, c.*\
          FROM users a \
					INNER JOIN match c ON a.uid = c.uid_1\
					INNER JOIN(SELECT uid, path, n_pic FROM img) b ON c.uid_1 = b.uid AND b.n_pic = 1 \
					WHERE uid_2 = $1\
					UNION\
					SELECT a.firstname, a.gender, a.popularity, a.sexual_orientation, a.name, a.login, a.connected ,b.*, c.*\
          FROM users a \
					INNER JOIN match c ON c.uid_2 = a.uid\
					INNER JOIN(SELECT uid, path, n_pic FROM img ) b ON c.uid_2 = b.uid AND b.n_pic = 1\
          WHERE uid_1 = $1",

    [user_uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        response.status(200).json(results.rows);
      }
    }
  );
};

const like = (req, res) => {
  const liker = req.signedCookies.info.uid;
  const liked = req.body.likedUid;
  pool.query("SELECT * FROM likes WHERE uid_liker = $1 AND uid_liked = $2", [liker, liked], (error, results) => {
    if (error) {
      throw error;
    } else if (results.rows.length) {
      pool.query("DELETE FROM likes WHERE uid_liker = $1 AND uid_liked = $2", [liker, liked], (error, results) => {
        if (error) {
          throw error;
        }
        res.json({ info: "unlike" }).status(200);
      });
    } else {
      pool.query("INSERT INTO likes (uid_liker, uid_liked) VALUES ($1, $2)", [liker, liked], (error, results) => {
        if (error) {
          throw error;
        }
        res.json({ info: "like" }).status(200);
      });
    }
  });
};

const getMessages = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  const match_uid = request.params.match_uid;
  pool.query(
    "SELECT * FROM chat WHERE (uid_sender = $1 AND uid_receiver = $2) OR (uid_sender = $2 AND uid_receiver = $1)",
    [user_uid, match_uid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const createMessages = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  const match_uid = request.params.match_uid;
  const msg = request.body.msg;
  pool.query(
    "INSERT INTO chat (uid_sender, uid_receiver, msg, date) VALUES ($1, $2, $3, $4)",
    [user_uid, match_uid, msg, moment()],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        response.status(200).json({ message: "Sent", info: "message" });
      }
    }
  );
};
const getUsersProfile = (request, response) => {
  const uid = request.params.uid;
  pool.query(
    "SELECT users.id, users.uid, birthday, firstname, gender, popularity, sexual_orientation, name, login, description, country, connected, last_connection, n_pic, img.path, array_agg(tag.tag) as tag FROM users LEFT JOIN img ON img.uid = users.uid LEFT JOIN tag ON tag.uid = users.uid WHERE users.uid = $1 AND n_pic = 1 GROUP BY users.id, img.n_pic, img.path",
    //"SELECT * FROM users LEFT JOIN img ON img.uid = users.uid WHERE users.uid = $1 AND n_pic = 1",
    [uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        response.status(200).json(results.rows);
      }
    }
  );
};

const getAllImg = (request, response) => {
  const uid = request.params.uid;
  pool.query("SELECT * FROM img WHERE uid = $1 AND NOT n_pic = 1", [uid], (error, results) => {
    if (error) {
      throw error;
    } else {
      response.status(200).json(results.rows);
    }
  });
};

const getOneLike = (request, response) => {
  pool.query(
    "SELECT * FROM likes WHERE uid_liker = $1 AND uid_liked = $2",
    [request.signedCookies.info.uid, request.params.uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        response.status(200).json(results.rows);
      }
    }
  );
};

const getYouLike = (request, response) => {
  pool.query(
    "SELECT * FROM likes WHERE uid_liker = $1 AND uid_liked = $2",
    [request.params.uid, request.signedCookies.info.uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        response.status(200).json(results.rows);
      }
    }
  );
};

const addReport = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  const profile_uid = request.body.uidUser;
  pool.query(
    "SELECT * FROM report WHERE uid_reported = $1 AND uid_reporter = $2",
    [profile_uid, user_uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        if (!results.rowCount) {
          pool.query(
            "INSERT INTO report (uid_reporter, uid_reported, date_insert) VALUES ($1, $2, $3)",
            [user_uid, profile_uid, new Date(Date.now())],
            (error, results) => {
              if (error) {
                throw error;
              } else {
                response.status(200).json({ message: "Sent", info: "message" });
              }
            }
          );
        }
      }
      response.status(403).json({ info: "Forbidden" });
    }
  );
};

const getBlock = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  const profile_uid = request.params.uid;
  pool.query(
    "SELECT * FROM block WHERE uid_blocked = $1 AND uid_blocker= $2",
    [profile_uid, user_uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        if (results.rows.length) {
          response.status(200).json("block");
        } else {
          response.status(200).json("unblock");
        }
      }
    }
  );
};

const addBlock = (request, response) => {
  const user_uid = request.signedCookies.info.uid;
  const profile_uid = request.body.uidUser;
  pool.query(
    "SELECT * FROM block WHERE uid_blocked = $1 AND uid_blocker= $2",
    [profile_uid, user_uid],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        if (!results.rowCount) {
          pool.query(
            "INSERT INTO block (uid_blocker, uid_blocked, date_insert) VALUES ($1, $2, $3)",
            [user_uid, profile_uid, new Date(Date.now())],
            (error, results) => {
              if (error) {
                throw error;
              } else {
                response.status(200).json({ info: "block" });
              }
            }
          );
        } else {
          pool.query(
            "DELETE FROM block WHERE uid_blocked = $1 AND uid_blocker= $2",
            [profile_uid, user_uid],
            (error, results) => {
              if (error) {
                throw error;
              } else {
                response.status(200).json({ info: "unblock" });
              }
            }
          );
        }
      }
    }
  );
};

const updatePopularity = (request, response) => {
  const uid = request.signedCookies.info.uid;
  const popularity = request.signedCookies.info.popularity;
  pool.query("SELECT * FROM likes WHERE uid_liker = $1", [uid], (error, resultsLike) => {
    if (error) {
      throw error;
    } else {
      nb_likes = resultsLike.rowCount;
      pool.query("SELECT * FROM match WHERE uid_1 = $1 OR uid_2 = $1", [uid], (error, resultsMatch) => {
        if (error) {
          throw error;
        } else {
          var nb_match = resultsMatch.rowCount;
          var ratio = nb_match / nb_likes;
          var newPopularity = popularity;
          if (ratio < 0.25) newPopularity += ratio * -10;
          else if (ratio > 0.75) newPopularity += ratio * 2;
          if (newPopularity < 0 || newPopularity > 100) newPopularity = newPopularity < 0 ? 0 : 100;
          pool.query("UPDATE users SET popularity = $2 WHERE uid = $1", [uid, newPopularity], (error, results) => {
            if (error) {
              throw error;
            } else {
              response.status(200).json({ info: newPopularity });
            }
          });
        }
      });
    }
  });
};
module.exports = {
  pool,
  getUsers,
  getUsersImg,
  getLikes,
  getUsersByUid,
  postSearch,
  setConnected,
  setDisconnected,
  checkPic,
  getUserById,
  createUser,
  deleteUser,
  getUserByEmail,
  createNotif,
  getNotif,
  getNotifNb,
  setNotifSeen,
  updateLocation,
  createMatch,
  deleteMatch,
  like,
  getMatch,
  getMessages,
  createMessages,
  getUsersProfile,
  getAllImg,
  getOneLike,
  getYouLike,
  updatePopularity,
  addReport,
  addBlock,
  getBlock,
};
