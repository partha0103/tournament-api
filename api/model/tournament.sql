CREATE TABLE `user` (
  `username` varchar(30) NOT NULL,
  `password` varchar(300) DEFAULT NULL,
  `flag` int(10) DEFAULT '0',
  `email` varchar(50) DEFAULT NULL,
  `id` int(10) NOT NULL AUTO_INCREMENT,
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `id` (`id`)
)

CREATE TABLE `tournament` (
  `user_id` int(10) NOT NULL,
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `status` varchar(40) DEFAULT 'Yet to start',
  `winner` varchar(30) DEFAULT 'Not declared',
  PRIMARY KEY (`user_id`,`id`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `tournament_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE `player` (
  `tournament_id` int(10) NOT NULL,
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `user_id` int(10) DEFAULT NULL,
  PRIMARY KEY (`tournament_id`,`id`),
  UNIQUE KEY `id` (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `player_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournament` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `player_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE TABLE `matches` (
  `tournament_id` int(10) NOT NULL,
  `player1_id` int(10) NOT NULL,
  `player2_id` int(10) NOT NULL,
  `winner_id` int(10) NOT NULL,
  `round` int(4) DEFAULT '0',
  `r_status` varchar(30) DEFAULT 'Not started',
  PRIMARY KEY (`player1_id`,`player2_id`),
  KEY `tournament_id` (`tournament_id`),
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournament` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)

Create view matchs_count as Select players.tournament_id as tournament_id, players.id as player_id, count(player1_id) as matches from players left join matches on players.id = matches.player1_name  or players.id = matches.player2_name   group by players.id;

Create view win_count as Select players.tournament_id as tournament_id ,players.id as player_id, count(matches.winner_id) as wins from players left join matches on player.id = matches.winner_id group by players.id order by wins Desc;

