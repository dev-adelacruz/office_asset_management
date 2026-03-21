# frozen_string_literal: true

class CreateAssetRequests < ActiveRecord::Migration[8.1]
  def change
    create_table :asset_requests do |t|
      t.references :user, null: false, foreign_key: true
      t.string :asset_type, null: false
      t.text :justification, null: false
      t.string :urgency, null: false, default: "medium"
      t.date :preferred_fulfillment_date
      t.string :status, null: false, default: "pending"
      t.text :notes

      t.timestamps
    end

    add_index :asset_requests, :status
    add_index :asset_requests, :urgency
    add_index :asset_requests, :asset_type
    add_index :asset_requests, :created_at
  end
end
