# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::DestroyLicenseSeatInteractor do
  let!(:seat) { create(:license_seat) }

  subject(:result) { described_class.call(license_seat: seat) }

  it "succeeds" do
    expect(result).to be_success
  end

  it "destroys the LicenseSeat record" do
    expect { result }.to change(LicenseSeat, :count).by(-1)
  end
end
