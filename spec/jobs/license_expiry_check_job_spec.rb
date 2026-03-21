# frozen_string_literal: true

require "rails_helper"

RSpec.describe LicenseExpiryCheckJob do
  let!(:manager) { create(:user, :manager) }
  let!(:executive) { create(:user, :executive) }

  describe "#perform" do
    context "when licenses are expiring in 60 days" do
      let!(:license) { create(:license, expiry_date: Date.today + 60, notify_at_60_days: true) }

      it "creates notifications for managers and executives" do
        expect {
          described_class.new.perform
        }.to change(Notification, :count).by(2)
      end

      it "enqueues expiry alert emails" do
        expect {
          described_class.new.perform
        }.to have_enqueued_mail(LicenseMailer, :expiry_alert).twice
      end

      it "sets notification_type to expiry_60" do
        described_class.new.perform
        expect(Notification.last.notification_type).to eq("expiry_60")
      end
    end

    context "when licenses are expiring in 30 days" do
      let!(:license) { create(:license, expiry_date: Date.today + 30, notify_at_30_days: true) }

      it "creates notifications for managers and executives" do
        expect {
          described_class.new.perform
        }.to change(Notification, :count).by(2)
      end

      it "sets notification_type to expiry_30" do
        described_class.new.perform
        expect(Notification.last.notification_type).to eq("expiry_30")
      end
    end

    context "when licenses are expiring in 7 days" do
      let!(:license) { create(:license, expiry_date: Date.today + 7, notify_at_7_days: true) }

      it "creates notifications for managers and executives" do
        expect {
          described_class.new.perform
        }.to change(Notification, :count).by(2)
      end

      it "sets notification_type to expiry_7" do
        described_class.new.perform
        expect(Notification.last.notification_type).to eq("expiry_7")
      end
    end

    context "when notify_at_60_days is false" do
      let!(:license) { create(:license, expiry_date: Date.today + 60, notify_at_60_days: false) }

      it "does not create notifications" do
        expect {
          described_class.new.perform
        }.not_to change(Notification, :count)
      end
    end

    context "when notification already sent today" do
      let!(:license) { create(:license, expiry_date: Date.today + 30, notify_at_30_days: true) }

      before do
        create(:notification, user: manager, notifiable: license, notification_type: "expiry_30")
      end

      it "does not create duplicate notifications" do
        expect {
          described_class.new.perform
        }.not_to change(Notification, :count)
      end
    end

    context "when no managers or executives exist" do
      let!(:license) { create(:license, expiry_date: Date.today + 30) }
      let(:employee) { create(:user, :employee) }

      before { manager.destroy; executive.destroy }

      it "does not create any notifications" do
        expect {
          described_class.new.perform
        }.not_to change(Notification, :count)
      end
    end
  end
end
