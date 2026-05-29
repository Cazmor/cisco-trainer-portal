-- Clear existing curriculum
DELETE FROM module_curriculum;

-- Module 1
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(1, 'Introduction to Personal Computer Hardware', 1.1, 'Personal Computer Safety', 'ESD, Electrical Safety', 1),
(1, 'Introduction to Personal Computer Hardware', 1.2, 'PC Components', 'Cases, Power Supplies, Motherboards, CPUs, Memory, Storage, Ports, Input/Output', 1),
(1, 'Introduction to Personal Computer Hardware', 1.3, 'Computer Disassembly', 'Toolkit, Disassembly Process', 1),
(1, 'Introduction to Personal Computer Hardware', 1.4, 'Labs', 'Safety, Disassemble a Computer', 1),
(1, 'Introduction to Personal Computer Hardware', 1.5, 'Summary & Quiz', 'Module 1 Assessment', 1);

-- Module 2
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(2, 'PC Assembly', 2.1, 'Assemble the Computer', 'Fire Safety, Power Supply, CPU, RAM, Motherboard, Drives, Adapter Cards, Cables', 1),
(2, 'PC Assembly', 2.2, 'Labs', 'Install Power Supply, Motherboard, Drives, Adapter Cards, Internal Cables, Front Panel', 1),
(2, 'PC Assembly', 2.3, 'Summary & Quiz', 'Module 2 Assessment', 1);

-- Module 3
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(3, 'Advanced Computer Hardware', 3.1, 'Boot the Computer', 'POST, BIOS, CMOS, UEFI', 1),
(3, 'Advanced Computer Hardware', 3.2, 'Electrical Power', 'Wattage, Voltage, Power Protection', 1),
(3, 'Advanced Computer Hardware', 3.3, 'Advanced Functionality', 'CPU Architectures, RAID, Ports, Monitors', 1),
(3, 'Advanced Computer Hardware', 3.4, 'Computer Configuration', 'Hardware Upgrades', 1),
(3, 'Advanced Computer Hardware', 3.5, 'Protecting the Environment', 'Safe Disposal', 1),
(3, 'Advanced Computer Hardware', 3.6, 'Labs', 'BIOS Settings, Firmware Updates, Install Windows, Ohm Law, Hardware Upgrade Research', 1),
(3, 'Advanced Computer Hardware', 3.7, 'Summary & Quiz', 'Module 3 Assessment', 1);

-- Module 4
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(4, 'Preventive Maintenance and Troubleshooting', 4.1, 'Preventive Maintenance', 'Dust, Internal Components, Environment, Software', 1),
(4, 'Preventive Maintenance and Troubleshooting', 4.2, 'Troubleshooting Process', '6 Steps: Identify, Theory, Test, Plan, Verify, Document', 1),
(4, 'Preventive Maintenance and Troubleshooting', 4.3, 'Common Problems', 'Storage, Motherboard, Power Supply, CPU, Memory, Display', 1),
(4, 'Preventive Maintenance and Troubleshooting', 4.4, 'Labs', 'Multimeter, Power Supply Tester, Troubleshoot Hardware', 1),
(4, 'Preventive Maintenance and Troubleshooting', 4.5, 'Summary & Quiz', 'Module 4 Assessment', 1);

-- Module 5
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(5, 'Networking Concepts', 5.1, 'Network Components and Types', 'Topologies, Internet Connections', 1),
(5, 'Networking Concepts', 5.2, 'Protocols, Standards, Services', 'TCP/IP, UDP, Port Numbers, Wireless, DHCP, DNS, Print, File, Web, Mail', 1),
(5, 'Networking Concepts', 5.3, 'Network Devices', 'NIC, Switches, WAP, Routers, Firewalls, IDS/IPS', 1),
(5, 'Networking Concepts', 5.4, 'Network Cables', 'Copper, Fiber, Tools, Pinouts', 1),
(5, 'Networking Concepts', 5.5, 'Labs', 'Build and Test Network Cable', 1),
(5, 'Networking Concepts', 5.6, 'Summary & Quiz', 'Module 5 Assessment', 1);

-- Module 6
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(6, 'Applied Networking', 6.1, 'Device to Network Connection', 'MAC, IPv4, IPv6, Static/Dynamic, DNS, DHCP, VLAN, NIC Configuration', 1),
(6, 'Applied Networking', 6.2, 'Configure Wired/Wireless Network', 'Router Setup, Wireless Settings, QoS, NAT', 1),
(6, 'Applied Networking', 6.3, 'Firewall Settings', 'UPnP, DMZ, Port Forwarding, MAC Filtering', 1),
(6, 'Applied Networking', 6.4, 'IoT Device Configuration', 'IoT Setup', 1),
(6, 'Applied Networking', 6.5, 'Network Troubleshooting', '6 Steps, Common Problems, Network Tools', 1),
(6, 'Applied Networking', 6.6, 'Labs', 'Configure NIC, Wireless Network, Firewall, Troubleshoot Network', 1),
(6, 'Applied Networking', 6.7, 'Summary & Quiz', 'Module 6 Assessment', 1);

-- Continue for Modules 7-14... (truncated for space but this gives you the structure)

-- Module 7
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(7, 'Laptops and Other Mobile Devices', 7.1, 'Mobile Device Overview', 'Laptops, Smartphones, Tablets, Wearables, AR/VR', 1),
(7, 'Laptops and Other Mobile Devices', 7.2, 'Laptop Components', 'Motherboards, Display, Keyboard, Wireless, Webcam', 1),
(7, 'Laptops and Other Mobile Devices', 7.3, 'Laptop Configuration', 'Power Settings, Wireless, Bluetooth', 1),
(7, 'Laptops and Other Mobile Devices', 7.4, 'Hardware Replacement', 'Keyboard, Screen, DC Jack, Battery, Storage, Wireless Card, CPU, Motherboard', 1),
(7, 'Laptops and Other Mobile Devices', 7.5, 'Mobile Device Features', 'Touch Interface, GPS, NFC, VPN, Virtual Assistants', 1),
(7, 'Laptops and Other Mobile Devices', 7.6, 'Network Connectivity', 'Cellular, Wi-Fi, Bluetooth, Email, Synchronization', 1),
(7, 'Laptops and Other Mobile Devices', 7.7, 'Preventive Maintenance', 'Mobile Device Maintenance', 1),
(7, 'Laptops and Other Mobile Devices', 7.8, 'Labs', 'Mobile Device Info, Research Docking Stations, Laptop Screens, Batteries, Drives', 1),
(7, 'Laptops and Other Mobile Devices', 7.9, 'Summary & Quiz', 'Module 7 Assessment', 1);

-- Module 8
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(8, 'Printers', 8.1, 'Common Printer Features', 'Speed, Quality, Color, Connections', 1),
(8, 'Printers', 8.2, 'Printer Types', 'Inkjet, Laser, Thermal, Impact, Virtual, 3D', 1),
(8, 'Printers', 8.3, 'Installing and Configuring Printers', 'Installation, Configuration', 1),
(8, 'Printers', 8.4, 'Sharing Printers', 'Network, Print Servers', 1),
(8, 'Printers', 8.5, 'Maintaining and Troubleshooting', 'Preventive Maintenance, 6-Step Process', 1),
(8, 'Printers', 8.6, 'Labs', 'Install Printer, Share Printer, Inkjet Maintenance, Laser Maintenance', 1),
(8, 'Printers', 8.7, 'Summary & Quiz', 'Module 8 Assessment', 1);

-- Module 9
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(9, 'Virtualization and Cloud Computing', 9.1, 'Virtualization', 'Server Virtualization, Hypervisors, Virtual Machines', 1),
(9, 'Virtualization and Cloud Computing', 9.2, 'Cloud Computing', 'Cloud Services, SaaS/IaaS/PaaS, Cloud Characteristics', 1),
(9, 'Virtualization and Cloud Computing', 9.3, 'Labs', 'Install Linux in Virtual Machine', 1),
(9, 'Virtualization and Cloud Computing', 9.4, 'Summary & Quiz', 'Module 9 Assessment', 1);

-- Module 10
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(10, 'Windows Installation', 10.1, 'Modern Operating Systems', 'Features, Requirements, 32-bit vs 64-bit, Upgrades', 1),
(10, 'Windows Installation', 10.2, 'Disk Management', 'Partitioning, File Systems', 1),
(10, 'Windows Installation', 10.3, 'Windows Installation', 'Basic, Custom, Cloning, Recovery, Boot Sequence', 1),
(10, 'Windows Installation', 10.4, 'Labs', 'Create Partition, Windows Installation, Finalize Installation, Boot Methods', 1),
(10, 'Windows Installation', 10.5, 'Summary & Quiz', 'Module 10 Assessment', 1);

-- Module 11
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(11, 'Windows Configuration', 11.1, 'Windows Desktop and File Explorer', 'Start Menu, Taskbar, Task Manager, Libraries', 1),
(11, 'Windows Configuration', 11.2, 'Control Panels', 'User Accounts, Network, Display, Power, Hardware, Programs', 1),
(11, 'Windows Configuration', 11.3, 'System Administration', 'Computer Management, Event Viewer, Registry, Disk Management', 1),
(11, 'Windows Configuration', 11.4, 'Command-Line Tools', 'PowerShell, Command Shell, File System CLI, Disk CLI', 1),
(11, 'Windows Configuration', 11.5, 'Windows Networking', 'Sharing, Mapping Drives, Remote Desktop, VPN', 1),
(11, 'Windows Configuration', 11.6, 'Preventive Maintenance for OS', 'Updates, Backup, Restore, Scheduled Tasks', 1),
(11, 'Windows Configuration', 11.7, 'Troubleshooting Windows', '6 Steps, Common Problems, Advanced Solutions', 1),
(11, 'Windows Configuration', 11.8, 'Labs', 'Control Panel, Device Manager, Virtual Memory, System Utilities, File System Commands', 1),
(11, 'Windows Configuration', 11.9, 'Summary & Quiz', 'Module 11 Assessment', 1);

-- Module 12
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(12, 'Mobile, Linux, and macOS Operating Systems', 12.1, 'Mobile Operating Systems', 'Android vs iOS, Touch Interface, GPS, NFC', 1),
(12, 'Mobile, Linux, and macOS Operating Systems', 12.2, 'Mobile Device Security', 'Passcodes, Biometrics, Remote Backup, Antivirus', 1),
(12, 'Mobile, Linux, and macOS Operating Systems', 12.3, 'Linux and macOS', 'GUI, CLI, Backup, Disk Utilities, Permissions', 1),
(12, 'Mobile, Linux, and macOS Operating Systems', 12.4, 'Troubleshooting Other OS', 'Common Problems', 1),
(12, 'Mobile, Linux, and macOS Operating Systems', 12.5, 'Labs', 'Working with Android, Working with iOS, Mobile Device Features, Passcode Locks', 1),
(12, 'Mobile, Linux, and macOS Operating Systems', 12.6, 'Summary & Quiz', 'Module 12 Assessment', 1);

-- Module 13
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(13, 'Security', 13.1, 'Security Threats', 'Malware, Viruses, Trojan Horses, Network Attacks, Social Engineering', 1),
(13, 'Security', 13.2, 'Security Procedures', 'Security Policy, Physical Security, Data Protection, Encryption, Data Destruction', 1),
(13, 'Security', 13.3, 'Securing Windows', 'BIOS Security, Login, Local Security Policy, Users/Groups, Firewall, Web Security', 1),
(13, 'Security', 13.4, 'Wireless Security', 'Encryption, Authentication, WPA/WPA2, Firewalls', 1),
(13, 'Security', 13.5, 'Troubleshooting Security', '6 Steps, Common Problems', 1),
(13, 'Security', 13.6, 'Labs', 'OS Security, BitLocker, Local Security Policy, Users/Groups, Windows Firewall', 1),
(13, 'Security', 13.7, 'Summary & Quiz', 'Module 13 Assessment', 1);

-- Module 14
INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES
(14, 'The IT Professional', 14.1, 'Communication Skills', 'Active Listening, Professional Behavior, Customer Handling', 1),
(14, 'The IT Professional', 14.2, 'Operational Procedures', 'Documentation, Change Management, Disaster Recovery', 1),
(14, 'The IT Professional', 14.3, 'Ethical and Legal Considerations', 'PII, PCI, PHI, Licensing, Computer Forensics', 1),
(14, 'The IT Professional', 14.4, 'Call Center Technicians', 'Level 1/2 Responsibilities, Basic Scripting', 1),
(14, 'The IT Professional', 14.5, 'Labs', 'Remote Technician - Hardware, OS, Network, Security Problems; Write Basic Scripts', 1),
(14, 'The IT Professional', 14.6, 'Summary & Quiz', 'Module 14 Assessment', 1);
