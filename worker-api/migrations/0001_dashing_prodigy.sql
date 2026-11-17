ALTER TABLE `messages` ADD `ip_hash` text;--> statement-breakpoint
CREATE INDEX `messages_ip_created_idx` ON `messages` (`ip_hash`,`created_at`);