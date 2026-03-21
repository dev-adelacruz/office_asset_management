# frozen_string_literal: true

class CreateAssetAssignmentLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :asset_assignment_logs do |t|
      t.references :asset, null: false, foreign_key: true
      t.references :assigned_to, null: false, foreign_key: { to_table: :users }
      t.references :assigned_by, null: false, foreign_key: { to_table: :users }
      t.datetime :assigned_at, null: false
      t.datetime :returned_at
      t.text :notes

      t.timestamps
    end

    add_index :asset_assignment_logs, :assigned_at
  end
end
