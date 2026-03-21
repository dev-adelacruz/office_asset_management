# frozen_string_literal: true

RSpec.shared_examples "auditable" do
  let(:actor) { create(:user) }

  describe "audit trail" do
    context "when Current.user is set" do
      around do |example|
        Current.user = actor
        example.run
        Current.user = nil
      end

      it "creates an audit log on create" do
        expect { create(described_class.name.underscore.to_sym) }
          .to change(AuditLog, :count).by(1)

        log = AuditLog.last
        expect(log.action).to eq("create")
        expect(log.actor).to eq(actor)
        expect(log.changes_before).to eq({})
        expect(log.auditable_type).to eq(described_class.name)
      end

      it "creates an audit log on update" do
        record = create(described_class.name.underscore.to_sym)
        AuditLog.delete_all

        record.update!(auditable_update_attrs)

        expect(AuditLog.count).to eq(1)
        log = AuditLog.last
        expect(log.action).to eq("update")
        expect(log.actor).to eq(actor)
      end

      it "creates an audit log on destroy" do
        record = create(described_class.name.underscore.to_sym)
        AuditLog.delete_all

        record.destroy!

        expect(AuditLog.count).to eq(1)
        log = AuditLog.last
        expect(log.action).to eq("destroy")
        expect(log.changes_after).to eq({})
      end
    end

    context "when Current.user is nil" do
      before { Current.user = nil }

      it "does not create an audit log on create" do
        expect { create(described_class.name.underscore.to_sym) }
          .not_to change(AuditLog, :count)
      end

      it "does not create an audit log on update" do
        Current.user = create(:user)
        record = create(described_class.name.underscore.to_sym)
        Current.user = nil
        AuditLog.delete_all

        record.update!(auditable_update_attrs)
        expect(AuditLog.count).to eq(0)
      end

      it "does not create an audit log on destroy" do
        Current.user = create(:user)
        record = create(described_class.name.underscore.to_sym)
        Current.user = nil
        AuditLog.delete_all

        record.destroy!
        expect(AuditLog.count).to eq(0)
      end
    end
  end
end
