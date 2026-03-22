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

ActiveRecord::Schema[8.1].define(version: 2026_03_22_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "asset_assignment_logs", force: :cascade do |t|
    t.bigint "asset_id", null: false
    t.datetime "assigned_at", null: false
    t.bigint "assigned_by_id", null: false
    t.bigint "assigned_to_id", null: false
    t.datetime "created_at", null: false
    t.text "notes"
    t.datetime "returned_at"
    t.datetime "updated_at", null: false
    t.index ["asset_id"], name: "index_asset_assignment_logs_on_asset_id"
    t.index ["assigned_at"], name: "index_asset_assignment_logs_on_assigned_at"
    t.index ["assigned_by_id"], name: "index_asset_assignment_logs_on_assigned_by_id"
    t.index ["assigned_to_id"], name: "index_asset_assignment_logs_on_assigned_to_id"
  end

  create_table "asset_request_status_logs", force: :cascade do |t|
    t.bigint "asset_request_id", null: false
    t.bigint "changed_by_id", null: false
    t.datetime "created_at", null: false
    t.string "from_status"
    t.string "to_status", null: false
    t.datetime "updated_at", null: false
    t.index ["asset_request_id"], name: "index_asset_request_status_logs_on_asset_request_id"
    t.index ["changed_by_id"], name: "index_asset_request_status_logs_on_changed_by_id"
    t.index ["created_at"], name: "index_asset_request_status_logs_on_created_at"
  end

  create_table "asset_requests", force: :cascade do |t|
    t.bigint "asset_id"
    t.string "asset_type", null: false
    t.datetime "created_at", null: false
    t.text "justification", null: false
    t.bigint "license_id"
    t.text "notes"
    t.date "preferred_fulfillment_date"
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.string "urgency", default: "medium", null: false
    t.bigint "user_id", null: false
    t.index ["asset_id"], name: "index_asset_requests_on_asset_id"
    t.index ["asset_type"], name: "index_asset_requests_on_asset_type"
    t.index ["created_at"], name: "index_asset_requests_on_created_at"
    t.index ["license_id"], name: "index_asset_requests_on_license_id"
    t.index ["status"], name: "index_asset_requests_on_status"
    t.index ["urgency"], name: "index_asset_requests_on_urgency"
    t.index ["user_id"], name: "index_asset_requests_on_user_id"
  end

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

  create_table "audit_logs", force: :cascade do |t|
    t.string "action", null: false
    t.bigint "actor_id"
    t.bigint "auditable_id", null: false
    t.string "auditable_type", null: false
    t.jsonb "changes_after", default: {}, null: false
    t.jsonb "changes_before", default: {}, null: false
    t.datetime "created_at", null: false
    t.index ["action"], name: "index_audit_logs_on_action"
    t.index ["actor_id"], name: "index_audit_logs_on_actor_id"
    t.index ["auditable_type", "auditable_id"], name: "index_audit_logs_on_auditable"
    t.index ["auditable_type", "auditable_id"], name: "index_audit_logs_on_auditable_type_and_auditable_id"
    t.index ["created_at"], name: "index_audit_logs_on_created_at"
  end

  create_table "license_seats", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "license_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["license_id", "user_id"], name: "index_license_seats_on_license_id_and_user_id", unique: true
    t.index ["license_id"], name: "index_license_seats_on_license_id"
    t.index ["user_id"], name: "index_license_seats_on_user_id"
  end

  create_table "licenses", force: :cascade do |t|
    t.decimal "cost", precision: 10, scale: 2, null: false
    t.datetime "created_at", null: false
    t.date "expiry_date", null: false
    t.text "license_key", null: false
    t.text "notes"
    t.boolean "notify_at_30_days", default: true, null: false
    t.boolean "notify_at_60_days", default: true, null: false
    t.boolean "notify_at_7_days", default: true, null: false
    t.string "purchase_order_number"
    t.string "renewal_contact"
    t.string "software_name", null: false
    t.integer "total_seats", null: false
    t.datetime "updated_at", null: false
    t.string "vendor", null: false
    t.index ["expiry_date"], name: "index_licenses_on_expiry_date"
  end

  create_table "notifications", force: :cascade do |t|
    t.string "body", null: false
    t.datetime "created_at", null: false
    t.bigint "notifiable_id", null: false
    t.string "notifiable_type", null: false
    t.string "notification_type", null: false
    t.datetime "read_at"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["notifiable_type", "notifiable_id", "notification_type"], name: "idx_notifications_on_notifiable_and_type"
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
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

  add_foreign_key "asset_assignment_logs", "assets"
  add_foreign_key "asset_assignment_logs", "users", column: "assigned_by_id"
  add_foreign_key "asset_assignment_logs", "users", column: "assigned_to_id"
  add_foreign_key "asset_request_status_logs", "asset_requests"
  add_foreign_key "asset_request_status_logs", "users", column: "changed_by_id"
  add_foreign_key "asset_requests", "assets"
  add_foreign_key "asset_requests", "licenses"
  add_foreign_key "asset_requests", "users"
  add_foreign_key "asset_status_logs", "assets"
  add_foreign_key "asset_status_logs", "users", column: "changed_by_id"
  add_foreign_key "audit_logs", "users", column: "actor_id"
  add_foreign_key "license_seats", "licenses"
  add_foreign_key "license_seats", "users"
  add_foreign_key "notifications", "users"
end
