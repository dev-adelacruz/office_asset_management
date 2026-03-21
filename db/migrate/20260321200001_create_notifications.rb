class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :notifiable, polymorphic: true, null: false
      t.string :title, null: false
      t.string :body, null: false
      t.string :notification_type, null: false
      t.datetime :read_at

      t.timestamps
    end

    add_index :notifications, [ :user_id, :read_at ]
    add_index :notifications,
              [ :notifiable_type, :notifiable_id, :notification_type ],
              name: :idx_notifications_on_notifiable_and_type
  end
end
