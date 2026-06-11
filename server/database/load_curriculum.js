const { Pool } = require('pg');
const { makeDbConfig } = require('./poolConfig');
require('dotenv').config();
const p = new Pool(makeDbConfig());

const curriculum = [
// Module 1
[1,'Introduction to Personal Computer Hardware',1.1,'Personal Computer Safety','ESD, Electrical Safety'],
[1,'Introduction to Personal Computer Hardware',1.2,'PC Components','Cases, Power Supplies, Motherboards, CPUs, Memory, Storage, Ports, Input/Output'],
[1,'Introduction to Personal Computer Hardware',1.3,'Computer Disassembly','Toolkit, Disassembly Process'],
[1,'Introduction to Personal Computer Hardware',1.4,'Labs','Safety, Disassemble a Computer'],
[1,'Introduction to Personal Computer Hardware',1.5,'Summary & Quiz','Module 1 Assessment'],
// Module 2
[2,'PC Assembly',2.1,'Assemble the Computer','Fire Safety, Power Supply, CPU, RAM, Motherboard, Drives, Adapter Cards, Cables'],
[2,'PC Assembly',2.2,'Labs','Install Power Supply, Motherboard, Drives, Adapter Cards, Internal Cables, Front Panel'],
[2,'PC Assembly',2.3,'Summary & Quiz','Module 2 Assessment'],
// Module 3
[3,'Advanced Computer Hardware',3.1,'Boot the Computer','POST, BIOS, CMOS, UEFI'],
[3,'Advanced Computer Hardware',3.2,'Electrical Power','Wattage, Voltage, Power Protection'],
[3,'Advanced Computer Hardware',3.3,'Advanced Functionality','CPU Architectures, RAID, Ports, Monitors'],
[3,'Advanced Computer Hardware',3.4,'Computer Configuration','Hardware Upgrades'],
[3,'Advanced Computer Hardware',3.5,'Protecting the Environment','Safe Disposal'],
[3,'Advanced Computer Hardware',3.6,'Labs','BIOS Settings, Firmware Updates, Install Windows, Ohm Law, Hardware Upgrade Research'],
[3,'Advanced Computer Hardware',3.7,'Summary & Quiz','Module 3 Assessment'],
// Module 4
[4,'Preventive Maintenance and Troubleshooting',4.1,'Preventive Maintenance','Dust, Internal Components, Environment, Software'],
[4,'Preventive Maintenance and Troubleshooting',4.2,'Troubleshooting Process','6 Steps: Identify, Theory, Test, Plan, Verify, Document'],
[4,'Preventive Maintenance and Troubleshooting',4.3,'Common Problems','Storage, Motherboard, Power Supply, CPU, Memory, Display'],
[4,'Preventive Maintenance and Troubleshooting',4.4,'Labs','Multimeter, Power Supply Tester, Troubleshoot Hardware'],
[4,'Preventive Maintenance and Troubleshooting',4.5,'Summary & Quiz','Module 4 Assessment'],
// Module 5
[5,'Networking Concepts',5.1,'Network Components and Types','Topologies, Internet Connections'],
[5,'Networking Concepts',5.2,'Protocols, Standards, Services','TCP/IP, UDP, Port Numbers, Wireless, DHCP, DNS, Print, File, Web, Mail'],
[5,'Networking Concepts',5.3,'Network Devices','NIC, Switches, WAP, Routers, Firewalls, IDS/IPS'],
[5,'Networking Concepts',5.4,'Network Cables','Copper, Fiber, Tools, Pinouts'],
[5,'Networking Concepts',5.5,'Labs','Build and Test Network Cable'],
[5,'Networking Concepts',5.6,'Summary & Quiz','Module 5 Assessment'],
// Module 6
[6,'Applied Networking',6.1,'Device to Network Connection','MAC, IPv4, IPv6, Static/Dynamic, DNS, DHCP, VLAN, NIC Configuration'],
[6,'Applied Networking',6.2,'Configure Wired/Wireless Network','Router Setup, Wireless Settings, QoS, NAT'],
[6,'Applied Networking',6.3,'Firewall Settings','UPnP, DMZ, Port Forwarding, MAC Filtering'],
[6,'Applied Networking',6.4,'IoT Device Configuration','IoT Setup'],
[6,'Applied Networking',6.5,'Network Troubleshooting','6 Steps, Common Problems, Network Tools'],
[6,'Applied Networking',6.6,'Labs','Configure NIC, Wireless Network, Firewall, Troubleshoot Network'],
[6,'Applied Networking',6.7,'Summary & Quiz','Module 6 Assessment'],
// Module 7
[7,'Laptops and Other Mobile Devices',7.1,'Mobile Device Overview','Laptops, Smartphones, Tablets, Wearables, AR/VR'],
[7,'Laptops and Other Mobile Devices',7.2,'Laptop Components','Motherboards, Display, Keyboard, Wireless, Webcam'],
[7,'Laptops and Other Mobile Devices',7.3,'Laptop Configuration','Power Settings, Wireless, Bluetooth'],
[7,'Laptops and Other Mobile Devices',7.4,'Hardware Replacement','Keyboard, Screen, DC Jack, Battery, Storage, Wireless Card, CPU, Motherboard'],
[7,'Laptops and Other Mobile Devices',7.5,'Mobile Device Features','Touch Interface, GPS, NFC, VPN, Virtual Assistants'],
[7,'Laptops and Other Mobile Devices',7.6,'Network Connectivity','Cellular, Wi-Fi, Bluetooth, Email, Synchronization'],
[7,'Laptops and Other Mobile Devices',7.7,'Preventive Maintenance','Mobile Device Maintenance'],
[7,'Laptops and Other Mobile Devices',7.8,'Labs','Mobile Device Info, Research Docking Stations, Laptop Screens, Batteries, Drives'],
[7,'Laptops and Other Mobile Devices',7.9,'Summary & Quiz','Module 7 Assessment'],
// Module 8
[8,'Printers',8.1,'Common Printer Features','Speed, Quality, Color, Connections'],
[8,'Printers',8.2,'Printer Types','Inkjet, Laser, Thermal, Impact, Virtual, 3D'],
[8,'Printers',8.3,'Installing and Configuring Printers','Installation, Configuration'],
[8,'Printers',8.4,'Sharing Printers','Network, Print Servers'],
[8,'Printers',8.5,'Maintaining and Troubleshooting','Preventive Maintenance, 6-Step Process'],
[8,'Printers',8.6,'Labs','Install Printer, Share Printer, Inkjet Maintenance, Laser Maintenance'],
[8,'Printers',8.7,'Summary & Quiz','Module 8 Assessment'],
// Module 9
[9,'Virtualization and Cloud Computing',9.1,'Virtualization','Server Virtualization, Hypervisors, Virtual Machines'],
[9,'Virtualization and Cloud Computing',9.2,'Cloud Computing','Cloud Services, SaaS/IaaS/PaaS, Cloud Characteristics'],
[9,'Virtualization and Cloud Computing',9.3,'Labs','Install Linux in Virtual Machine'],
[9,'Virtualization and Cloud Computing',9.4,'Summary & Quiz','Module 9 Assessment'],
// Module 10
[10,'Windows Installation',10.1,'Modern Operating Systems','Features, Requirements, 32-bit vs 64-bit, Upgrades'],
[10,'Windows Installation',10.2,'Disk Management','Partitioning, File Systems'],
[10,'Windows Installation',10.3,'Windows Installation','Basic, Custom, Cloning, Recovery, Boot Sequence'],
[10,'Windows Installation',10.4,'Labs','Create Partition, Windows Installation, Finalize Installation, Boot Methods'],
[10,'Windows Installation',10.5,'Summary & Quiz','Module 10 Assessment'],
// Module 11
[11,'Windows Configuration',11.1,'Windows Desktop and File Explorer','Start Menu, Taskbar, Task Manager, Libraries'],
[11,'Windows Configuration',11.2,'Control Panels','User Accounts, Network, Display, Power, Hardware, Programs'],
[11,'Windows Configuration',11.3,'System Administration','Computer Management, Event Viewer, Registry, Disk Management'],
[11,'Windows Configuration',11.4,'Command-Line Tools','PowerShell, Command Shell, File System CLI, Disk CLI'],
[11,'Windows Configuration',11.5,'Windows Networking','Sharing, Mapping Drives, Remote Desktop, VPN'],
[11,'Windows Configuration',11.6,'Preventive Maintenance for OS','Updates, Backup, Restore, Scheduled Tasks'],
[11,'Windows Configuration',11.7,'Troubleshooting Windows','6 Steps, Common Problems, Advanced Solutions'],
[11,'Windows Configuration',11.8,'Labs','Control Panel, Device Manager, Virtual Memory, System Utilities, File System Commands'],
[11,'Windows Configuration',11.9,'Summary & Quiz','Module 11 Assessment'],
// Module 12
[12,'Mobile, Linux, and macOS Operating Systems',12.1,'Mobile Operating Systems','Android vs iOS, Touch Interface, GPS, NFC'],
[12,'Mobile, Linux, and macOS Operating Systems',12.2,'Mobile Device Security','Passcodes, Biometrics, Remote Backup, Antivirus'],
[12,'Mobile, Linux, and macOS Operating Systems',12.3,'Linux and macOS','GUI, CLI, Backup, Disk Utilities, Permissions'],
[12,'Mobile, Linux, and macOS Operating Systems',12.4,'Troubleshooting Other OS','Common Problems'],
[12,'Mobile, Linux, and macOS Operating Systems',12.5,'Labs','Working with Android, Working with iOS, Mobile Device Features, Passcode Locks'],
[12,'Mobile, Linux, and macOS Operating Systems',12.6,'Summary & Quiz','Module 12 Assessment'],
// Module 13
[13,'Security',13.1,'Security Threats','Malware, Viruses, Trojan Horses, Network Attacks, Social Engineering'],
[13,'Security',13.2,'Security Procedures','Security Policy, Physical Security, Data Protection, Encryption, Data Destruction'],
[13,'Security',13.3,'Securing Windows','BIOS Security, Login, Local Security Policy, Users/Groups, Firewall, Web Security'],
[13,'Security',13.4,'Wireless Security','Encryption, Authentication, WPA/WPA2, Firewalls'],
[13,'Security',13.5,'Troubleshooting Security','6 Steps, Common Problems'],
[13,'Security',13.6,'Labs','OS Security, BitLocker, Local Security Policy, Users/Groups, Windows Firewall'],
[13,'Security',13.7,'Summary & Quiz','Module 13 Assessment'],
// Module 14
[14,'The IT Professional',14.1,'Communication Skills','Active Listening, Professional Behavior, Customer Handling'],
[14,'The IT Professional',14.2,'Operational Procedures','Documentation, Change Management, Disaster Recovery'],
[14,'The IT Professional',14.3,'Ethical and Legal Considerations','PII, PCI, PHI, Licensing, Computer Forensics'],
[14,'The IT Professional',14.4,'Call Center Technicians','Level 1/2 Responsibilities, Basic Scripting'],
[14,'The IT Professional',14.5,'Labs','Remote Technician - Hardware, OS, Network, Security Problems; Write Basic Scripts'],
[14,'The IT Professional',14.6,'Summary & Quiz','Module 14 Assessment']
];

async function load() {
    try {
        // Clear existing
        await p.query('DELETE FROM module_curriculum');
        // Insert all
        for (const c of curriculum) {
            await p.query(
                'INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics, centre_id) VALUES ($1,$2,$3,$4,$5,1)',
                [c[0], c[1], c[2], c[3], c[4]]
            );
        }
        console.log('Full IT Essentials v8 curriculum loaded! ' + curriculum.length + ' sections across 14 modules.');
    } catch (e) { console.error(e.message); }
    finally { await p.end(); }
}
load();
