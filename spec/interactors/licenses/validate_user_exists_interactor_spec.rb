# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::ValidateUserExistsInteractor do
  subject(:result) { described_class.call(user_email: email) }

  describe "when the user exists" do
    let!(:user) { create(:user, :employee) }
    let(:email) { user.email }

    it "succeeds" do
      expect(result).to be_success
    end

    it "writes the user to context" do
      expect(result.user).to eq(user)
    end
  end

  describe "when the user does not exist" do
    let(:email) { "ghost@example.com" }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "sets http_status to :not_found" do
      expect(result.http_status).to eq(:not_found)
    end

    it "includes the email in the message" do
      expect(result.message).to include("ghost@example.com")
    end
  end
end
