CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`role` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'idle' NOT NULL,
	`working_on` text,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`from_type` text DEFAULT 'user' NOT NULL,
	`from_id` text NOT NULL,
	`from_name` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feed_items` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`agent_id` text,
	`type` text DEFAULT 'content' NOT NULL,
	`action` text DEFAULT '' NOT NULL,
	`task_title` text,
	`preview` text DEFAULT '{}' NOT NULL,
	`reactions` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `objectives` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`tasks_total` integer DEFAULT 0 NOT NULL,
	`tasks_complete` integer DEFAULT 0 NOT NULL,
	`start_date` text,
	`est_completion` text,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `output_files` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`folder_id` text,
	`name` text NOT NULL,
	`type` text DEFAULT 'code' NOT NULL,
	`status` text DEFAULT 'In Review' NOT NULL,
	`agent_id` text,
	`size` text DEFAULT '0 KB' NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`folder_id`) REFERENCES `output_folders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `output_folders` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`agent_id` text,
	`items` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`title` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`tools` text DEFAULT '[]' NOT NULL,
	`reward` text DEFAULT '' NOT NULL,
	`vesting` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`applicants` integer DEFAULT 0 NOT NULL,
	`urgency` text DEFAULT 'Normal' NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `startup_members` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'owner' NOT NULL,
	`joined_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `startups` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`initials` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '#9fe870' NOT NULL,
	`category` text DEFAULT 'Other' NOT NULL,
	`website` text,
	`visibility` text DEFAULT 'public' NOT NULL,
	`status` text DEFAULT 'Incubating' NOT NULL,
	`avatar_url` text,
	`banner_url` text,
	`owner_id` text NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `startups_slug_unique` ON `startups` (`slug`);--> statement-breakpoint
CREATE TABLE `task_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`author_type` text DEFAULT 'user' NOT NULL,
	`author_id` text NOT NULL,
	`author_name` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`objective_id` text,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`agent_id` text,
	`dependencies` text DEFAULT '[]' NOT NULL,
	`duration` text,
	`files` text DEFAULT '[]' NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`dislikes` integer DEFAULT 0 NOT NULL,
	`comments` integer DEFAULT 0 NOT NULL,
	`shares` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`objective_id`) REFERENCES `objectives`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`startup_id` text NOT NULL,
	`symbol` text NOT NULL,
	`icon_url` text,
	`vesting` text DEFAULT '' NOT NULL,
	`price` real DEFAULT 0 NOT NULL,
	`change_24h` text DEFAULT '+0%' NOT NULL,
	`change_positive` integer DEFAULT true NOT NULL,
	`volume` text DEFAULT '$0' NOT NULL,
	`mcap` text DEFAULT '$0' NOT NULL,
	`holders` text DEFAULT '0' NOT NULL,
	`liquidity` text DEFAULT '$0' NOT NULL,
	`supply` text DEFAULT '0' NOT NULL,
	`circulating_supply` text DEFAULT '0' NOT NULL,
	`ath` real DEFAULT 0 NOT NULL,
	`ath_date` text,
	`atl` real DEFAULT 0 NOT NULL,
	`atl_date` text,
	`created_at` text DEFAULT '(datetime())' NOT NULL,
	FOREIGN KEY (`startup_id`) REFERENCES `startups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tokens_startup_id_unique` ON `tokens` (`startup_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`wallet_address` text NOT NULL,
	`created_at` text DEFAULT '(datetime())' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_wallet_address_unique` ON `users` (`wallet_address`);