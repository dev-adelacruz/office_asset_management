# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_21_150000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "asset_status_logs", force: :cascade do |t|
    t.bigint "asset_id", null: false
    t.bigint "changed_by_id", null: false
    t.datetime "created_at", null: false
    t.string "from_status"
    t.string "to_status", null: false
    t.datetime "updated_at", null: false
    t.index ["asset_id"], name: "index_asset_status_logs_on_asset_id"
    t.index ["changed_by_id"], name: "index_asset_status_logs_on_changed_by_id"
    t.index ["created_at"], name: "index_asset_status_logs_on_created_at"
  end

  create_table "assets", force: :cascade do |t|
    t.string "asset_code", null: false
    t.string "category", null: false
    t.string "condition", null: false
    t.datetime "created_at", null: false
    t.string "location"
    t.string "manufacturer"
    t.string "model"
    t.string "name", null: false
    t.text "notes"
    t.decimal "purchase_cost", precision: 10, scale: 2, null: false
    t.date "purchase_date", null: false
    t.string "serial_number", null: false
    t.string "status", default: "available", null: false
    t.datetime "updated_at", null: false
    t.date "warranty_expiry"
    t.index ["asset_code"], name: "index_assets_on_asset_code", unique: true
    t.index ["category"], name: "index_assets_on_category"
    t.index ["serial_number"], name: "index_assets_on_serial_number", unique: true
    t.index ["status"], name: "index_assets_on_status"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "jti"
    t.string "name"
    t.string "office_location"
    t.string "phone_number"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "role", default: "employee", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "asset_status_logs", "assets"
  add_foreign_key "asset_status_logs", "users", column: "changed_by_id"
end
