# frozen_string_literal: true

class CreateLicenseSeats < ActiveRecord::Migration[8.1]
  def change
    create_table :license_seats do |t|
      t.references :license, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :license_seats, [ :license_id, :user_id ], unique: true
  end
end
