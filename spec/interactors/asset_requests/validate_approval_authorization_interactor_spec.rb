# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::ValidateApprovalAuthorizationInteractor do
  subject(:result) { described_class.call(current_user: user) }

  describe "manager" do
    let!(:user) { create(:user, :manager) }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "executive" do
    let!(:user) { create(:user, :executive) }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "employee" do
    let!(:user) { create(:user, :employee) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "sets http_status to :forbidden" do
      expect(result.http_status).to eq(:forbidden)
    end

    it "includes an authorization message" do
      expect(result.message).to include("not authorized")
    end
  end
end
