# frozen_string_literal: true

require "rails_helper"

RSpec.describe AuditLog do
  describe "validations" do
    it { is_expected.to validate_presence_of(:action) }
    it { is_expected.to validate_inclusion_of(:action).in_array(%w[create update destroy]) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:actor).class_name("User").optional }
    it { is_expected.to belong_to(:auditable) }
  end

  describe "scopes" do
    let!(:old_log) { create(:audit_log, created_at: 2.days.ago) }
    let!(:new_log) { create(:audit_log, created_at: 1.hour.ago) }

    it ".recent orders by created_at descending" do
      expect(described_class.recent.first).to eq(new_log)
    end

    it ".by_actor filters by actor_id" do
      expect(described_class.by_actor(old_log.actor_id)).to include(old_log)
      expect(described_class.by_actor(old_log.actor_id)).not_to include(new_log)
    end

    it ".by_actor with nil returns all" do
      expect(described_class.by_actor(nil).count).to eq(described_class.count)
    end

    it ".by_action filters by action" do
      create(:audit_log, action: "update")
      expect(described_class.by_action("create")).to all(have_attributes(action: "create"))
    end

    it ".from_date filters records on or after date" do
      expect(described_class.from_date(1.day.ago)).to include(new_log)
      expect(described_class.from_date(1.day.ago)).not_to include(old_log)
    end

    it ".to_date filters records on or before date" do
      expect(described_class.to_date(1.day.ago)).to include(old_log)
      expect(described_class.to_date(1.day.ago)).not_to include(new_log)
    end
  end
end
