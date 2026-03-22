# frozen_string_literal: true

require "rails_helper"

RSpec.describe Users::ValidateProfileUpdateAuthorizationInteractor do
  let!(:employee) { create(:user, :employee) }
  let!(:other_employee) { create(:user, :employee) }
  let!(:manager) { create(:user, :manager) }
  let!(:executive) { create(:user, :executive) }

  subject(:result) { described_class.call(current_user: current_user, target_user: target_user) }

  describe "employee updating own profile" do
    let(:current_user) { employee }
    let(:target_user) { employee }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "employee updating another user's profile" do
    let(:current_user) { employee }
    let(:target_user) { other_employee }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "sets http_status to :forbidden" do
      expect(result.http_status).to eq(:forbidden)
    end

    it "includes a relevant message" do
      expect(result.message).to include("Forbidden")
    end
  end

  describe "manager updating any user's profile" do
    let(:current_user) { manager }
    let(:target_user) { employee }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "executive updating any user's profile" do
    let(:current_user) { executive }
    let(:target_user) { employee }

    it "succeeds" do
      expect(result).to be_success
    end
  end
end
