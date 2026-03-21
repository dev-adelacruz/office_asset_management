# frozen_string_literal: true

require "rails_helper"

RSpec.describe LicenseMailer do
  let(:manager) { create(:user, :manager) }
  let(:license) { create(:license, :expiring_soon) }

  describe "#expiry_alert" do
    let(:mail) { described_class.expiry_alert(manager, license, 30) }

    it "renders the subject" do
      expect(mail.subject).to include("License Expiry Alert")
      expect(mail.subject).to include(license.software_name)
      expect(mail.subject).to include("30 days")
    end

    it "renders the recipient" do
      expect(mail.to).to eq([ manager.email ])
    end

    it "includes the software name in the body" do
      expect(mail.body.encoded).to include(license.software_name)
    end

    it "includes the vendor in the body" do
      expect(mail.body.encoded).to include(license.vendor)
    end

    it "includes the expiry date in the body" do
      expect(mail.body.encoded).to include(license.expiry_date.strftime("%B"))
    end
  end
end
