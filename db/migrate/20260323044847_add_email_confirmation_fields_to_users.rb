class AddEmailConfirmationFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :pending_email, :string
    add_column :users, :email_confirmation_token, :string
    add_column :users, :email_confirmation_sent_at, :datetime
    add_index :users, :email_confirmation_token
  end
end
