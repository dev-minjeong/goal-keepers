ALTER TABLE notification_tb
ALTER COLUMN message TYPE varchar(60);

ALTER TABLE notification_tb
ALTER COLUMN type SET NOT NULL;

ALTER TABLE notification_tb
ALTER COLUMN receiver_id SET NOT NULL;