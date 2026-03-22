# frozen_string_literal: true

class AddItemReferencesToAssetRequests < ActiveRecord::Migration[7.2]
  def change
    add_reference :asset_requests, :asset, null: true, foreign_key: true
    add_reference :asset_requests, :license, null: true, foreign_key: true
  end
end
