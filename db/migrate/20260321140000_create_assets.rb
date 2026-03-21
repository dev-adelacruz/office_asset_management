# frozen_string_literal: true

class CreateAssets < ActiveRecord::Migration[8.1]
  def change
    create_table :assets do |t|
      t.string :asset_code, null: false
      t.string :name, null: false
      t.string :category, null: false
      t.string :serial_number, null: false
      t.date :purchase_date, null: false
      t.decimal :purchase_cost, precision: 10, scale: 2, null: false
      t.string :condition, null: false
      t.string :status, null: false, default: "available"
      t.string :manufacturer
      t.string :model
      t.date :warranty_expiry
      t.string :location
      t.text :notes

      t.timestamps
    end

    add_index :assets, :asset_code, unique: true
    add_index :assets, :serial_number, unique: true
    add_index :assets, :status
    add_index :assets, :category
  end
end
