CREATE INDEX `email_idx` ON `posts` (`authorid`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `user` (`email`);