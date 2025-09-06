DROP TABLE `posts`;--> statement-breakpoint
DROP INDEX `user_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `email` ON `user` (`email`);