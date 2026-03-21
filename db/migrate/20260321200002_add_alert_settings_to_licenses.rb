class AddAlertSettingsToLicenses < ActiveRecord::Migration[8.1]
  def change
    add_column :licenses, :notify_at_60_days, :boolean, default: true, null: false
    add_column :licenses, :notify_at_30_days, :boolean, default: true, null: false
    add_column :licenses, :notify_at_7_days, :boolean, default: true, null: false
  end
end
