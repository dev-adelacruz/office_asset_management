# frozen_string_literal: true

class AddLostStatusAndCreateAssetStatusLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :asset_status_logs do |t|
      t.references :asset, null: false, foreign_key: true
      t.references :changed_by, null: false, foreign_key: { to_table: :users }
      t.string :from_status
      t.string :to_status, null: false

      t.timestamps
    end

    add_index :asset_status_logs, :created_at
  end
end
