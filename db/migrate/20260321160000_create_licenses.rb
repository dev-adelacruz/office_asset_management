# frozen_string_literal: true

class CreateLicenses < ActiveRecord::Migration[8.1]
  def change
    create_table :licenses do |t|
      t.string :software_name, null: false
      t.string :vendor, null: false
      t.text :license_key, null: false
      t.integer :total_seats, null: false
      t.decimal :cost, precision: 10, scale: 2, null: false
      t.date :expiry_date, null: false
      t.string :renewal_contact
      t.string :purchase_order_number
      t.text :notes

      t.timestamps
    end

    add_index :licenses, :expiry_date
  end
end
