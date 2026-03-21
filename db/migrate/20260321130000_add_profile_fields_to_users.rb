# frozen_string_literal: true

class AddProfileFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :name, :string
    add_column :users, :phone_number, :string
    add_column :users, :office_location, :string
    add_column :users, :avatar_url, :string
  end
end
