# frozen_string_literal: true

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding DeskDex..."
puts "=" * 60

# Suppress audit logs during seeding (Auditable only fires when Current.user is set)
Current.user = nil

ActiveRecord::Base.transaction do
  # ===========================================================================
  # USERS (52 total: 1 executive, 1 manager, 50 employees)
  # ===========================================================================
  puts "\n[1/4] Creating users..."

  executive = User.find_or_create_by!(email: "sarah.chen@deskdex.com") do |u|
    u.name = "Sarah Chen"
    u.role = "executive"
    u.password = "password123"
    u.password_confirmation = "password123"
    u.office_location = "HQ - Floor 10"
    u.phone_number = "+1-555-0100"
  end

  manager = User.find_or_create_by!(email: "james.wu@deskdex.com") do |u|
    u.name = "James Wu"
    u.role = "manager"
    u.password = "password123"
    u.password_confirmation = "password123"
    u.office_location = "HQ - Floor 8"
    u.phone_number = "+1-555-0101"
  end

  employee_data = [
    [ "Alex Rivera",          "alex.rivera@deskdex.com",          "HQ - Floor 3" ],
    [ "Morgan Lee",           "morgan.lee@deskdex.com",           "HQ - Floor 3" ],
    [ "Jordan Kim",           "jordan.kim@deskdex.com",           "HQ - Floor 4" ],
    [ "Taylor Patel",         "taylor.patel@deskdex.com",         "HQ - Floor 4" ],
    [ "Casey Nguyen",         "casey.nguyen@deskdex.com",         "HQ - Floor 5" ],
    [ "Riley Thompson",       "riley.thompson@deskdex.com",       "HQ - Floor 5" ],
    [ "Drew Martinez",        "drew.martinez@deskdex.com",        "HQ - Floor 6" ],
    [ "Quinn Johnson",        "quinn.johnson@deskdex.com",        "HQ - Floor 6" ],
    [ "Avery Davis",          "avery.davis@deskdex.com",          "HQ - Floor 3" ],
    [ "Sam Wilson",           "sam.wilson@deskdex.com",           "HQ - Floor 3" ],
    [ "Chris Brown",          "chris.brown@deskdex.com",          "Branch - East" ],
    [ "Jamie Garcia",         "jamie.garcia@deskdex.com",         "Branch - East" ],
    [ "Blake Anderson",       "blake.anderson@deskdex.com",       "Branch - East" ],
    [ "Reese Thomas",         "reese.thomas@deskdex.com",         "Branch - East" ],
    [ "Cameron Jackson",      "cameron.jackson@deskdex.com",      "Branch - West" ],
    [ "Skyler White",         "skyler.white@deskdex.com",         "Branch - West" ],
    [ "Dakota Harris",        "dakota.harris@deskdex.com",        "Branch - West" ],
    [ "Peyton Martin",        "peyton.martin@deskdex.com",        "Branch - West" ],
    [ "Logan Clark",          "logan.clark@deskdex.com",          "HQ - Floor 4" ],
    [ "Hayden Lewis",         "hayden.lewis@deskdex.com",         "HQ - Floor 4" ],
    [ "Parker Robinson",      "parker.robinson@deskdex.com",      "HQ - Floor 5" ],
    [ "Sage Walker",          "sage.walker@deskdex.com",          "HQ - Floor 5" ],
    [ "Rowan Hall",           "rowan.hall@deskdex.com",           "HQ - Floor 6" ],
    [ "Emery Allen",          "emery.allen@deskdex.com",          "HQ - Floor 6" ],
    [ "Finley Young",         "finley.young@deskdex.com",         "Branch - East" ],
    [ "Elliot Hernandez",     "elliot.hernandez@deskdex.com",     "Branch - East" ],
    [ "Remy King",            "remy.king@deskdex.com",            "Branch - West" ],
    [ "Arlo Wright",          "arlo.wright@deskdex.com",          "Branch - West" ],
    [ "Marlowe Scott",        "marlowe.scott@deskdex.com",        "HQ - Floor 3" ],
    [ "Lennox Torres",        "lennox.torres@deskdex.com",        "HQ - Floor 3" ],
    [ "Indigo Flores",        "indigo.flores@deskdex.com",        "HQ - Floor 4" ],
    [ "Zephyr Green",         "zephyr.green@deskdex.com",         "HQ - Floor 4" ],
    [ "Caspian Adams",        "caspian.adams@deskdex.com",        "HQ - Floor 5" ],
    [ "Winter Nelson",        "winter.nelson@deskdex.com",        "HQ - Floor 5" ],
    [ "Soleil Carter",        "soleil.carter@deskdex.com",        "HQ - Floor 6" ],
    [ "Orion Mitchell",       "orion.mitchell@deskdex.com",       "HQ - Floor 6" ],
    [ "Phoenix Perez",        "phoenix.perez@deskdex.com",        "Branch - East" ],
    [ "Onyx Roberts",         "onyx.roberts@deskdex.com",         "Branch - East" ],
    [ "Cedar Turner",         "cedar.turner@deskdex.com",         "Branch - West" ],
    [ "Sable Phillips",       "sable.phillips@deskdex.com",       "Branch - West" ],
    [ "Briar Campbell",       "briar.campbell@deskdex.com",       "HQ - Floor 3" ],
    [ "Cobalt Parker",        "cobalt.parker@deskdex.com",        "HQ - Floor 3" ],
    [ "Flint Evans",          "flint.evans@deskdex.com",          "HQ - Floor 4" ],
    [ "Ivory Edwards",        "ivory.edwards@deskdex.com",        "HQ - Floor 4" ],
    [ "Jasper Collins",       "jasper.collins@deskdex.com",       "HQ - Floor 5" ],
    [ "Larkspur Stewart",     "larkspur.stewart@deskdex.com",     "HQ - Floor 5" ],
    [ "Malachite Sanchez",    "malachite.sanchez@deskdex.com",    "Branch - East" ],
    [ "Nimbus Morris",        "nimbus.morris@deskdex.com",        "Branch - East" ],
    [ "Obsidian Rogers",      "obsidian.rogers@deskdex.com",      "Branch - West" ],
    [ "Prism Reed",           "prism.reed@deskdex.com",           "Branch - West" ]
  ]

  employees = employee_data.map do |name, email, location|
    User.find_or_create_by!(email: email) do |u|
      u.name = name
      u.role = "employee"
      u.password = "password123"
      u.password_confirmation = "password123"
      u.office_location = location
    end
  end

  puts "  ✓ #{User.count} users (executive: #{executive.email}, manager: #{manager.email})"

  # ===========================================================================
  # ASSETS (300 total)
  # ===========================================================================
  puts "\n[2/4] Creating assets..."

  # Status distribution: available ~30%, assigned ~55%, under_maintenance ~8%, retired ~5%, lost ~2%
  statuses   = ([ "available" ] * 90) + ([ "assigned" ] * 165) + ([ "under_maintenance" ] * 24) + ([ "retired" ] * 15) + ([ "lost" ] * 6)
  conditions = ([ "new" ] * 40) + ([ "good" ] * 160) + ([ "fair" ] * 80) + ([ "poor" ] * 20)
  locations  = [ "HQ - Floor 3", "HQ - Floor 4", "HQ - Floor 5", "HQ - Floor 6", "Branch - East", "Branch - West" ]
  statuses.shuffle!
  conditions.shuffle!

  asset_specs = []

  # Laptops (~100)
  laptop_pool = [
    [ "MacBook Pro 14\"",    "Apple",     "MacBook Pro 14-inch M3 Pro",       1_999.00, "C02" ],
    [ "MacBook Air M2",      "Apple",     "MacBook Air 13-inch M2",           1_299.00, "C02" ],
    [ "MacBook Pro 16\"",    "Apple",     "MacBook Pro 16-inch M3 Max",       2_499.00, "C02" ],
    [ "Dell XPS 15",         "Dell",      "XPS 15 9530",                      1_799.00, "DEL" ],
    [ "Dell XPS 13",         "Dell",      "XPS 13 9340",                      1_299.00, "DEL" ],
    [ "ThinkPad X1 Carbon",  "Lenovo",    "ThinkPad X1 Carbon Gen 11",        1_549.00, "LNV" ],
    [ "ThinkPad T14s",       "Lenovo",    "ThinkPad T14s Gen 4",              1_099.00, "LNV" ],
    [ "HP EliteBook 840",    "HP",        "EliteBook 840 G10",                1_249.00, "5CG" ],
    [ "HP ZBook Firefly",    "HP",        "ZBook Firefly 14 G10",             1_649.00, "5CG" ],
    [ "Surface Laptop 5",    "Microsoft", "Surface Laptop 5 13.5\"",          1_299.00, "MSF" ]
  ]
  100.times { |i| asset_specs << laptop_pool[i % laptop_pool.length] + [ "laptop" ] }

  # Monitors (~60)
  monitor_pool = [
    [ "Dell UltraSharp U2722D",  "Dell",     "U2722D 27\" 4K",        549.00,  "DEL" ],
    [ "LG 27UK850",              "LG",       "27UK850-W 27\" 4K",     479.00,  "LGD" ],
    [ "Samsung 32\" Curved",     "Samsung",  "C32G55TQWR 32\" QHD",   399.00,  "SAM" ],
    [ "BenQ PD2705Q",            "BenQ",     "PD2705Q 27\" QHD",      449.00,  "BNQ" ],
    [ "Apple Studio Display",    "Apple",    "Studio Display 27\"",   1_599.00, "C02" ],
    [ "Dell P2723D",             "Dell",     "P2723D 27\" QHD",       329.00,  "DEL" ]
  ]
  60.times { |i| asset_specs << monitor_pool[i % monitor_pool.length] + [ "monitor" ] }

  # Peripherals (~80)
  peripheral_pool = [
    [ "Logitech MX Keys Keyboard",    "Logitech",  "MX Keys",               99.99,  "LGT" ],
    [ "Logitech MX Master 3 Mouse",   "Logitech",  "MX Master 3S",          99.99,  "LGT" ],
    [ "Jabra Evolve2 75 Headset",     "Jabra",     "Evolve2 75",            379.00, "JBR" ],
    [ "Logitech C920 Webcam",         "Logitech",  "C920 HD Pro",           79.99,  "LGT" ],
    [ "Anker USB-C Hub",              "Anker",     "PowerExpand 13-in-1",   59.99,  "ANK" ],
    [ "Apple Magic Keyboard",         "Apple",     "Magic Keyboard",        99.00,  "C02" ],
    [ "Apple Magic Mouse",            "Apple",     "Magic Mouse",           79.00,  "C02" ],
    [ "Elgato Stream Deck",           "Elgato",    "Stream Deck MK.2",      149.99, "ELG" ],
    [ "Sony WH-1000XM5 Headset",      "Sony",      "WH-1000XM5",            279.99, "SNY" ],
    [ "CalDigit TS4 Dock",            "CalDigit",  "TS4",                   349.99, "CDG" ]
  ]
  80.times { |i| asset_specs << peripheral_pool[i % peripheral_pool.length] + [ "peripheral" ] }

  # Furniture (~30)
  furniture_pool = [
    [ "Ergotron LX Sit-Stand Desk",  "Ergotron",       "LX Sit-Stand Desk",   549.00,  "EGT" ],
    [ "Herman Miller Aeron Chair",   "Herman Miller",  "Aeron Size B",        1_395.00, "HMC" ],
    [ "Secretlab Titan Chair",       "Secretlab",      "Titan Evo 2022",      449.00,  "SLB" ],
    [ "Ergotron Monitor Arm",        "Ergotron",       "LX Desk Monitor Arm", 149.99,  "EGT" ],
    [ "Rain Design Laptop Stand",    "Rain Design",    "mStand 360",          79.99,   "RDS" ],
    [ "Humanscale M8 Monitor Arm",   "Humanscale",     "M8.1",                299.00,  "HUM" ]
  ]
  30.times { |i| asset_specs << furniture_pool[i % furniture_pool.length] + [ "furniture" ] }

  # Other (~30)
  other_pool = [
    [ "iPad Pro 12.9\"",       "Apple",                    "iPad Pro 12.9\" M2",          1_099.00, "C02" ],
    [ "Apple TV 4K",           "Apple",                    "Apple TV 4K (3rd gen)",        129.00, "C02" ],
    [ "Raspberry Pi 4",        "Raspberry Pi Foundation",  "Raspberry Pi 4 Model B 8GB",    75.00, "RPF" ],
    [ "Synology NAS Drive",    "Synology",                 "DS923+",                        599.00, "SYN" ],
    [ "Ubiquiti UniFi AP",     "Ubiquiti",                 "U6 Long-Range",                 179.00, "UBQ" ],
    [ "Amazon Echo Show",      "Amazon",                   "Echo Show 10 (3rd gen)",         249.99, "AMZ" ]
  ]
  30.times { |i| asset_specs << other_pool[i % other_pool.length] + [ "other" ] }

  created_assets = []
  asset_specs.each_with_index do |spec, i|
    name, manufacturer, model, cost, serial_prefix, category = spec
    # Deterministic serial based on index — ensures idempotency across re-runs
    serial = "#{serial_prefix}#{format("%09d", i)}"

    asset = Asset.find_or_initialize_by(serial_number: serial)
    if asset.new_record?
      asset.assign_attributes(
        name: name,
        category: category,
        manufacturer: manufacturer,
        model: model,
        purchase_cost: cost,
        purchase_date: rand(4.years.ago..1.year.ago).to_date,
        condition: conditions[i % conditions.length],
        status: statuses[i % statuses.length],
        location: locations[i % locations.length],
        warranty_expiry: rand(1.year.from_now..3.years.from_now).to_date
      )
      asset.save!
    end
    created_assets << asset
  end

  puts "  ✓ #{Asset.count} assets created"

  # ===========================================================================
  # ASSET ASSIGNMENT LOGS (for all 'assigned' assets)
  # ===========================================================================
  puts "\n[3/4] Creating assignment logs..."

  assigned_assets = created_assets.select(&:assigned?)
  assigned_assets.each do |asset|
    next if AssetAssignmentLog.exists?(asset: asset, returned_at: nil)

    AssetAssignmentLog.create!(
      asset: asset,
      assigned_to: employees.sample,
      assigned_by: manager,
      assigned_at: rand(3.years.ago..6.months.ago),
      returned_at: nil
    )
  end

  puts "  ✓ #{AssetAssignmentLog.count} assignment logs"

  # ===========================================================================
  # LICENSES (50 total)
  # ===========================================================================
  puts "\n[4/4] Creating licenses and seat assignments..."

  today = Date.today

  licenses_data = [
    [ "Microsoft 365 Business Premium", "Microsoft",  60,  15_840.00,  today + 18.months ],
    [ "Slack Pro",                      "Slack",       55,  4_785.00,   today + 12.months ],
    [ "Zoom Business",                  "Zoom",        40,  7_680.00,   today + 14.months ],
    [ "Adobe Creative Cloud",           "Adobe",       10,  6_600.00,   today + 10.months ],
    [ "Figma Professional",             "Figma",       15,  2_160.00,   today + 8.months ],
    [ "GitHub Enterprise",              "GitHub",      20,  5_040.00,   today + 24.months ],
    [ "Notion Team",                    "Notion",      52,  4_992.00,   today + 16.months ],
    [ "1Password Business",             "1Password",   52,  4_988.16,   today + 20.months ],
    [ "Jira Standard",                  "Atlassian",   52,  5_085.60,   today + 22.months ],
    [ "Confluence Standard",            "Atlassian",   52,  3_588.00,   today + 22.months ],
    [ "Loom Business",                  "Loom",        30,  4_500.00,   today + 15.months ],
    [ "Grammarly Business",             "Grammarly",   25,  4_500.00,   today + 13.months ],
    [ "Canva for Teams",                "Canva",       20,  3_117.60,   today + 17.months ],
    [ "Dropbox Business",               "Dropbox",     30,  5_400.00,   today + 19.months ],
    [ "Miro Team",                      "Miro",        20,  1_920.00,   today + 11.months ],
    [ "Linear Standard",                "Linear",      20,  1_920.00,   today + 9.months ],
    [ "Postman Pro",                    "Postman",     10,  1_440.00,   today + 7.months ],
    [ "Datadog Pro",                    "Datadog",     5,   900.00,     today + 6.months ],
    [ "Heroku Teams",                   "Heroku",      5,   1_500.00,   today + 5.months ],
    [ "AWS IAM Seats",                  "Amazon",      10,  2_400.00,   today + 30.months ],
    [ "Vercel Pro",                     "Vercel",      8,   960.00,     today + 36.months ],
    [ "Sentry Team",                    "Sentry",      15,  2_340.00,   today + 21.months ],
    [ "Intercom Starter",               "Intercom",    5,   2_388.00,   today + 4.months ],
    [ "HubSpot Sales Pro",              "HubSpot",     10,  6_000.00,   today + 23.months ],
    [ "Salesforce Essentials",          "Salesforce",  8,   3_840.00,   today + 25.months ],
    [ "Zendesk Support",                "Zendesk",     10,  4_800.00,   today + 26.months ],
    [ "Asana Business",                 "Asana",       30,  5_700.00,   today + 27.months ],
    [ "Monday.com Pro",                 "Monday",      20,  4_800.00,   today + 28.months ],
    [ "Airtable Pro",                   "Airtable",    15,  2_700.00,   today + 29.months ],
    [ "Zapier Professional",            "Zapier",      5,   1_788.00,   today + 31.months ],
    [ "Webflow CMS",                    "Webflow",     3,   936.00,     today + 32.months ],
    [ "Amplitude Analytics",            "Amplitude",   10,  3_600.00,   today + 33.months ],
    [ "Mixpanel Growth",                "Mixpanel",    10,  3_000.00,   today + 34.months ],
    [ "Tableau Creator",                "Tableau",     5,   8_400.00,   today + 35.months ],
    [ "Sketch",                         "Sketch",      8,   1_152.00,   today + 37.months ],
    [ "InVision Enterprise",            "InVision",    10,  2_400.00,   today + 38.months ],
    [ "Abstract Teams",                 "Abstract",    12,  1_728.00,   today + 39.months ],
    [ "Shortcut",                       "Shortcut",    20,  2_880.00,   today + 40.months ],
    [ "PagerDuty Business",             "PagerDuty",   8,   4_032.00,   today + 41.months ],
    [ "Okta SSO",                       "Okta",        60,  10_800.00,  today + 42.months ],
    [ "Zoom Rooms",                     "Zoom",        6,   2_160.00,   today + 43.months ],
    [ "Google Workspace Business",      "Google",      52,  15_912.00,  today + 44.months ],
    [ "DocuSign Business Pro",          "DocuSign",    5,   1_800.00,   today + 45.months ],
    [ "Calendly Teams",                 "Calendly",    15,  1_800.00,   today + 46.months ],
    [ "Typeform Pro",                   "Typeform",    5,   1_188.00,   today + 47.months ],
    [ "Notion AI",                      "Notion",      52,  4_992.00,   today + 48.months ],
    # Expiring soon — exercises expiry warning UI
    [ "Sketch (Legacy Team)",           "Sketch",      5,   720.00,     today + 25.days ],
    [ "Trello Premium",                 "Atlassian",   10,  1_200.00,   today + 18.days ],
    [ "LastPass Teams",                 "LastPass",    20,  1_680.00,   today + 10.days ],
    [ "Basecamp",                       "37signals",   15,  1_188.00,   today + 6.days ]
  ]

  created_licenses = licenses_data.map do |software_name, vendor, total_seats, cost, expiry|
    # license_key is encrypted — cannot use find_or_create_by on it; use software_name+vendor as identity
    License.find_by(software_name: software_name, vendor: vendor) ||
      License.create!(
        software_name: software_name,
        vendor: vendor,
        license_key: Array.new(4) { SecureRandom.alphanumeric(5).upcase }.join("-"),
        total_seats: total_seats,
        cost: cost,
        expiry_date: expiry
      )
  end

  puts "  ✓ #{License.count} licenses created"

  # Assign seats (up to 80% fill, idempotent)
  all_users = [ executive, manager ] + employees
  created_licenses.each do |license|
    next if license.license_seats.any?

    seats_to_fill = [ (license.total_seats * 0.8).floor, all_users.length ].min
    all_users.sample(seats_to_fill).each do |user|
      LicenseSeat.find_or_create_by!(license: license, user: user)
    end
  end

  puts "  ✓ #{LicenseSeat.count} license seat assignments"
end

puts "\n" + "=" * 60
puts "Seeding complete!"
puts "  Users:            #{User.count}"
puts "  Assets:           #{Asset.count}"
puts "  Assignment logs:  #{AssetAssignmentLog.count}"
puts "  Licenses:         #{License.count}"
puts "  License seats:    #{LicenseSeat.count}"
puts ""
puts "  Login as executive: sarah.chen@deskdex.com / password123"
puts "  Login as manager:   james.wu@deskdex.com   / password123"
puts "=" * 60
