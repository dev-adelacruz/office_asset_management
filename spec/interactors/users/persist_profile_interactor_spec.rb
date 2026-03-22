# frozen_string_literal: true

require "rails_helper"

RSpec.describe Users::PersistProfileInteractor do
  let!(:user) { create(:user, :employee) }
  let(:valid_params) { { name: "Updated Name", phone_number: "+639991234567" } }

  subject(:result) { described_class.call(target_user: user, profile_params: params) }

  describe "successful update" do
    let(:params) { valid_params }

    it "succeeds" do
      expect(result).to be_success
    end

    it "updates the user record" do
      result
      expect(user.reload.name).to eq("Updated Name")
      expect(user.reload.phone_number).to eq("+639991234567")
    end

    it "writes the updated target_user to context" do
      expect(result.target_user.name).to eq("Updated Name")
    end
  end

  describe "partial update — only provided fields change" do
    let(:params) { { name: "Updated Name" } }

    it "does not change unprovided fields" do
      original_phone = user.phone_number
      result
      expect(user.reload.phone_number).to eq(original_phone)
    end
  end
end
