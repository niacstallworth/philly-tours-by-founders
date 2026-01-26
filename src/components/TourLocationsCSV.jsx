import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function TourLocationsCSV() {
  const csvData = `Tour Name,Day,Stop Name,Address,Latitude,Longitude,Time,Description
"Black American Legacy & Quaker Heritage",Day 1,"Arch Street Friends Meeting House","Arch Street, Philadelphia, PA",,,Morning,"Oldest continuously used Quaker meeting house (1669-present)"
"Black American Legacy & Quaker Heritage",Day 1,"Free Quaker Meeting House","5th & Arch St, Philadelphia, PA",,,Morning,"Quakers who supported the Revolution (1783)"
"Black American Legacy & Quaker Heritage",Day 1,"Pennsylvania Abolition Society","6th & Chestnut St, Philadelphia, PA",,,Morning,"First abolitionist organization in the world (1775)"
"Black American Legacy & Quaker Heritage",Day 1,"Mother Bethel AME Church","419 S. 6th St, Philadelphia, PA",,,Morning,"Founded 1794 by Richard Allen, oldest parcel owned by African Americans"
"Black American Legacy & Quaker Heritage",Day 1,"President's House / Liberty Bell Center","6th & Market St, Philadelphia, PA",,,Afternoon,"George Washington's enslaved household exhibits"
"Black American Legacy & Quaker Heritage",Day 1,"Lombard Street Free African Society homes","600-700 block Lombard St, Philadelphia, PA",,,Afternoon,"Richard Allen, Absalom Jones, Cyrus Bustill homes"
"Black American Legacy & Quaker Heritage",Day 1,"Belfield Mansion","La Salle University campus, Olney, PA",,,Afternoon,"1711 Quaker summer estate, abolitionist ties"
"Black American Legacy & Quaker Heritage",Day 2,"Cliveden","6401 Germantown Ave, Philadelphia, PA",,,Morning,"1767 mansion, Battle of Germantown site"
"Black American Legacy & Quaker Heritage",Day 2,"Upsala","6430 Germantown Ave, Philadelphia, PA",,,Morning,"1798 Federal-style mansion"
"Black American Legacy & Quaker Heritage",Day 2,"Wyck","6026 Germantown Ave, Philadelphia, PA",,,Morning,"One of Germantown's oldest houses, abolitionist ties"
"Black American Legacy & Quaker Heritage",Day 2,"Deshler-Morris House","5442 Germantown Ave, Philadelphia, PA",,,Morning,"Washington's Germantown White House 1793-94"
"Black American Legacy & Quaker Heritage",Day 2,"Grumblethorpe","5267 Germantown Ave, Philadelphia, PA",,,Morning,"1744 summer home of Wister family"
"Black American Legacy & Quaker Heritage",Day 2,"Stenton","4601 N. 18th St, Philadelphia, PA",,,Morning,"Georgian mansion with complex slavery history"
"Black American Legacy & Quaker Heritage",Day 2,"Germantown Mennonite Meetinghouse","6119 Germantown Ave, Philadelphia, PA",,,Afternoon,"Site of 1688 Protest Against Slavery"
"Black American Legacy & Quaker Heritage",Day 2,"Johnson House","6306 Germantown Ave, Philadelphia, PA",40.0389,-75.1813,Afternoon,"Underground Railroad station"
"Black American Legacy & Quaker Heritage",Day 3,"The Woodlands","40th & Woodland Ave, Philadelphia, PA",,,Morning,"1770s neoclassical mansion and cemetery"
"Black American Legacy & Quaker Heritage",Day 3,"Belmont Mansion","2000 Belmont Mansion Dr, Fairmount Park, PA",,,Morning,"Underground Railroad stop"
"Black American Legacy & Quaker Heritage",Day 3,"Lemon Hill Mansion","Fairmount Park, Philadelphia, PA",,,Morning,"1799 Federal mansion, owned by Quaker Henry Pratt"
"Black American Legacy & Quaker Heritage",Day 3,"Cedar Grove & Laurel Hill mansions","Fairmount Park, Philadelphia, PA",,,Morning,"Quaker summer estates"
"Black American Legacy & Quaker Heritage",Day 3,"4700-4800 blocks of Walnut Street","Walnut St, Philadelphia, PA",,,Afternoon,"Twin Victorian mansions"
"Black American Legacy & Quaker Heritage",Day 3,"4600 Spruce Street","4600 Spruce St, Philadelphia, PA",,,Afternoon,"Former home of Dr. Nathan F. Mossell"
"Black American Legacy & Quaker Heritage",Day 3,"3911 Delancey Street","3911 Delancey St, Philadelphia, PA",,,Afternoon,"Childhood home of Marian Anderson"
"Black American Legacy & Quaker Heritage",Day 3,"Christian Street YMCA","1724 Christian St, Philadelphia, PA",,,Afternoon,"Pivotal site for Black intellectual life"
"Black American Legacy & Quaker Heritage",Day 3,"W.E.B. Du Bois College House","University of Pennsylvania, Philadelphia, PA",,,Evening,"Exhibit on The Philadelphia Negro study"
"Black American Legacy & Quaker Heritage",Day 4,"Strawberry Mansion","2450 Strawberry Mansion Dr, Philadelphia, PA",,,Morning,"Largest Federal-era mansion in Fairmount Park"
"Black American Legacy & Quaker Heritage",Day 4,"John Coltrane House","1511 N. 33rd St, Philadelphia, PA",,,Afternoon,"Home of legendary jazz musician"
"Black American Legacy & Quaker Heritage",Day 4,"Cecil B. Moore Avenue","Cecil B. Moore Ave, Philadelphia, PA",,,Afternoon,"Center of 1960s-70s Black Power era"
"Black American Legacy & Quaker Heritage",Day 4,"3200-3400 blocks Diamond & Susquehanna","Diamond St & Susquehanna Ave, Philadelphia, PA",,,Afternoon,"Historic Doctor's Row townhouses"
"Black American Legacy & Quaker Heritage",Day 4,"Freedom Theatre","North Philadelphia, PA",,,Afternoon,"Key cultural landmark"
"Black American Legacy & Quaker Heritage",Day 4,"Mount Pleasant","Fairmount Park, Philadelphia, PA",,,Late Afternoon,"Georgian masterpiece"
"Black American Legacy & Quaker Heritage",Day 4,"Ormiston","Fairmount Park, Philadelphia, PA",,,Late Afternoon,"Smallest Quaker-built Park mansion"
"Rainbow Girls Philadelphia",Day 1,"Masonic Temple","1 North Broad Street, Philadelphia, PA",,,9:00 AM,"Rainbow Check-In & Tour - Seven lodge rooms, Rainbow jewels, 1922 charter"
"Rainbow Girls Philadelphia",Day 1,"Reading Terminal Market","12th & Arch St, Philadelphia, PA",,,12:30 PM,"Rainbow-Colored Lunch - color-themed food stations"
"Rainbow Girls Philadelphia",Day 1,"Covenant House PA","Philadelphia, PA",,,2:00 PM,"Service Project - Pack 150 hygiene kits"
"Rainbow Girls Philadelphia",Day 1,"Hard Rock Cafe","1119 Market St, Philadelphia, PA",,,6:00 PM,"Rainbow Friendship Dinner with karaoke"
"Rainbow Girls Philadelphia",Day 2,"Arch Street Presbyterian Church","1724 Arch St, Philadelphia, PA",,,8:45 AM,"Rainbow Worship Service"
"Rainbow Girls Philadelphia",Day 2,"Green Eggs Café","33 S. 18th St, Philadelphia, PA",,,10:30 AM,"Colorful Brunch with rainbow bagels"
"Rainbow Girls Philadelphia",Day 2,"Please Touch Museum","Memorial Hall, Fairmount Park, PA",,,12:00 PM,"Rainbow Adventure - Imagination Playground"
"Rainbow Girls Philadelphia",Day 2,"Shofuso Japanese House & Garden","Fairmount Park, Philadelphia, PA",,,,"Walk the rainbow bridge"
"Rainbow Girls Philadelphia",Day 2,"Smith Memorial Playground","Fairmount Park, Philadelphia, PA",,,,"Giant wooden slide tradition"
"Rainbow Girls Philadelphia",Day 2,"Sweetbriar Mansion lawn","Fairmount Park, Philadelphia, PA",,,3:30 PM,"Closing Rainbow Ceremony with Pot of Gold"
"Divine 9 Legacy Tour",Day 1,"Alpha Phi Alpha - 42nd & Chestnut","42nd & Chestnut St, Philadelphia, PA",,,9:00 AM,"First graduate chapter house in America (1922)"
"Divine 9 Legacy Tour",Day 1,"Delta Sigma Theta - 40th & Market","40th & Market St, Philadelphia, PA",,,10:30 AM,"First public act marker, chartered 1920"
"Divine 9 Legacy Tour",Day 1,"Kappa Alpha Psi - 44th & Chestnut","44th & Chestnut St, Philadelphia, PA",,,12:00 PM,"First graduate chapter in nation (1919)"
"Divine 9 Legacy Tour",Day 1,"Sigma Gamma Rho - 48th & Spruce","48th & Spruce St, Philadelphia, PA",,,2:30 PM,"First graduate chapter Rho Sigma (1929)"
"Divine 9 Legacy Tour",Day 2,"Alpha Kappa Alpha - Ivy Legacy","1824 South St, Philadelphia, PA",,,9:00 AM,"First alumnae chapter (1918)"
"Divine 9 Legacy Tour",Day 2,"Zeta Phi Beta - 17th & Jefferson","17th & Jefferson St, Philadelphia, PA",,,10:30 AM,"First graduate chapter (1925), now mural"
"Divine 9 Legacy Tour",Day 2,"Phi Beta Sigma - 44th & Market","44th & Market St, Philadelphia, PA",,,11:30 AM,"First graduate chapter (1921)"
"Divine 9 Legacy Tour",Day 2,"Iota Phi Theta - Temple Greek Row","1900 N 13th St, Philadelphia, PA",,,2:30 PM,"First chapter north of Baltimore (1972)"
"Black American Sports",,"The Palestra","240 S 33rd St, Philadelphia, PA",,,9:00 AM,"Cathedral of College Basketball, Wilt Chamberlain history"
"Black American Sports",,"Allen Iverson's Hampton Park Courts","Hampton St & Master St, Strawberry Mansion, PA",,,10:00 AM,"Where AI perfected his crossover, 2019 mural"
"Black American Sports",,"Joe Frazier's Gym (Cloverlay)","2909-2911 N Broad St, Philadelphia, PA",,,11:00 AM,"Smokin' Joe's legendary training grounds"
"Black American Sports",,"Maxie's Pizza","Germantown Ave, Philadelphia, PA",,,12:00 PM,"North Philly staple, Joe Frazier favorite"
"Black American Sports",,"Dell Music Center","Ridge Ave & 33rd St, Fairmount Park, PA",,,1:00 PM,"Joe Louis Boxing Ring, 1940s-50s matches"
"Black American Sports",,"Overbrook High School","5898 Lancaster Ave, Philadelphia, PA",,,2:00 PM,"Wilt Chamberlain & Kobe Bryant's high school"
"Black American Sports",,"Marian Anderson Rec Center","740 S 17th St, Philadelphia, PA",,,3:30 PM,"Dawn Staley's training grounds"
"Black American Sports",,"Sonny Hill League @ Tustin","5901 W Columbia Ave, Philadelphia, PA",,,4:30 PM,"Oldest summer basketball league (1968)"
"Black American Sports",,"South Kitchen & Jazz Club","600 N Broad St, Philadelphia, PA",,,6:00 PM,"Soul food dinner with live music"
"Black Inventors Tour",,"Norbert Rillieux Way","33rd & Walnut St, Penn Campus, PA",,,9:00 AM,"Sugar refining inventor, first Black Penn student (1830-32)"
"Black Inventors Tour",,"Granville T. Woods Railway Site","Broad & Girard Ave, Philadelphia, PA",,,10:00 AM,"Black Edison, railway telegraph inventor (1887)"
"Black Inventors Tour",,"Sarah E. Goode House","1724 South St, Philadelphia, PA",,,11:00 AM,"First Black woman patent holder (1885)"
"Black Inventors Tour",,"Lewis Latimer Light Bulb Exhibit","15 S 7th St, Philadelphia History Museum, PA",,,1:00 PM,"Carbon filament patent (1881)"
"Black Inventors Tour",,"Frederick McKinley Jones Route","3400 block E. Ontario St, Port Richmond, PA",,,2:30 PM,"Portable refrigeration inventor (1940)"
"Black Inventors Tour",,"Dr. Charles Drew Blood Bank","800 Spruce St, Pennsylvania Hospital, PA",,,3:30 PM,"Blood plasma storage pioneer (1940s)"
"Black Inventors Tour",,"Garrett Morgan Traffic Signal","13th & Market St, Philadelphia, PA",,,5:00 PM,"Three-position traffic light inventor (1923)"
"Black Inventors Tour",,"African American Museum","701 Arch St, Philadelphia, PA",,,8:00 PM,"Black Inventors Hall of Fame exhibit"
"Library Story Hop Tour",,"Library Company of Philadelphia","1314 Locust St, Philadelphia, PA",,,9:00 AM,"1739 story of enslaved boy Othello granted reading privilege"
"Library Story Hop Tour",,"Athenaeum of Philadelphia","219 S 6th St, Philadelphia, PA",,,,"Edgar Allan Poe carved initials (1843)"
"Library Story Hop Tour",,"Free Library - Central Parkway","1901 Vine St, Philadelphia, PA",,,,"Charles Dickens and Grip the raven inspiration"
"Library Story Hop Tour",,"Rosenbach Museum & Library","2008 Delancey Pl, Philadelphia, PA",,,,"Maurice Sendak and Winnie-the-Pooh toys"
"Library Story Hop Tour",,"Historical Society of Pennsylvania","1300 Locust St, Philadelphia, PA",,,,"Original Constitution draft with Jefferson's edit"
"Library Story Hop Tour",,"Charles L. Blockson Collection","Sullivan Hall, Temple University, PA",,,,"Harriet Tubman's personal hymnbook"
"Library Story Hop Tour",,"Parkway Central Children's Dept","1901 Vine St, Philadelphia, PA",,,,"Original Winnie-the-Pooh toys (40 years)"
"Old York Road Corridor",Morning,"Old York Road & North Broad","6704 Old York Road, Philadelphia, PA",40.0505,-75.1462,9:00 AM,"Colonial gateway, free Black laborers built milestones"
"Old York Road Corridor",Morning,"Ogontz Theatre Site","6037 Ogontz Avenue, Philadelphia, PA",40.0482,-75.1468,9:45 AM,"Vaudeville palace for Black artists during segregation"
"Old York Road Corridor",Morning,"Cecil B. Moore Law Office","7101 Ogontz Avenue, Philadelphia, PA",40.0585,-75.1460,10:30 AM,"Civil rights leader's law practice"
"Old York Road Corridor",Lunch,"Relish Restaurant","7152 Ogontz Avenue, Philadelphia, PA",40.0592,-75.1458,12:00 PM,"Upscale soul food in historic mansion"
"Old York Road Corridor",Afternoon,"Happy Hollow Rec Center","5091 West Haines Street, Philadelphia, PA",40.0465,-75.1770,1:00 PM,"1967 race riots site, now community hub"
"Old York Road Corridor",Afternoon,"Johnson House Historic Site","6306 Germantown Avenue, Philadelphia, PA",40.0389,-75.1813,2:00 PM,"Active Underground Railroad station"
"Old York Road Corridor",Afternoon,"Cliveden Historic Site","6401 Germantown Avenue, Philadelphia, PA",40.0415,-75.1795,3:00 PM,"1777 Battle of Germantown, enslaved Africans' contributions"
"Old York Road Corridor",Late Afternoon,"Germantown High School","2950 West School House Lane, Philadelphia, PA",40.0360,-75.1910,4:00 PM,"First integrated high school in Philly"
"Old York Road Corridor",Evening,"Woodmere Art Museum","9201 Germantown Avenue, Philadelphia, PA",40.0462,-75.2150,5:00 PM,"We Speak: Black Artists exhibit"
"Old York Road Corridor",Evening,"The Nile Restaurant & Lounge","6008 Germantown Avenue, Philadelphia, PA",40.0460,-75.2010,6:30 PM,"Vegan soul food, founded by Black Panthers"
"Black Medical Legacy",Day 1,"Black Doctors Row","1500-2000 Christian St, Philadelphia, PA",,,9:00 AM,"Philly's first Black Historic District (2022)"
"Black Medical Legacy",Day 1,"Frederick Douglass Hospital","1522 Lombard St, Philadelphia, PA",,,10:30 AM,"Founded 1895 by Dr. Nathan F. Mossell"
"Black Medical Legacy",Day 1,"Mercy-Douglass Hospital","15th & Lombard St, Philadelphia, PA",,,11:30 AM,"Merged 1948, served Black patients"
"Black Medical Legacy",Day 1,"Dr. Virginia Alexander Clinic","Broad & Ridge Ave, Philadelphia, PA",,,1:30 PM,"1930s Aspiring Clinic, fought TB disparities"
"Black Medical Legacy",Day 1,"Mercy Hospital Site","50th & Woodland Ave, Philadelphia, PA",,,2:30 PM,"Pre-merger Black hospital (1907)"
"Black Medical Legacy",Day 2,"Free African Society","602-704 Lombard St, Philadelphia, PA",,,9:00 AM,"Black nurses saved Philly in 1793 yellow fever epidemic"
"Black Medical Legacy",Day 2,"Mother Bethel AME Church","419 S. 6th St, Philadelphia, PA",,,10:30 AM,"Hub for Black nurses during epidemics"
"Black Medical Legacy",Day 2,"Philadelphia General Hospital","34th & Civic Center Blvd, Philadelphia, PA",,,1:00 PM,"Old Blockley, Black nurses training"
"Black Medical Legacy",Day 2,"Mercy-Douglass Nurse Training","15th & Lombard St, Philadelphia, PA",,,2:30 PM,"Graduated 1,000+ Black nurses (1920s-1960s)"
"Black Medical Legacy",Day 2,"Barbara Bates Center","418 Curie Blvd, Penn Nursing School, PA",,,4:30 PM,"Archives on Black nurses"
"Black Medical Legacy",Day 3,"Holmesburg Prison","4510 State Rd, NE Philadelphia, PA",,,9:00 AM,"Dr. Kligman unauthorized testing 1951-1974"
"Black Medical Legacy",Day 3,"City Almshouse","34th & Saybrook, West Philly, PA",,,10:30 AM,"1800s dissection without consent"
"Black Medical Legacy",Day 3,"Pennsylvania Hospital","8th & Spruce St, Philadelphia, PA",,,11:30 AM,"Used enslaved bodies for anatomy (1760s-1800s)"
"Black Medical Legacy",Day 3,"MOVE Bombing Sites","6221 Osage Ave, Philadelphia, PA",,,1:30 PM,"1985 remains withheld and experimented on"
"Black Medical Legacy",Day 3,"Yellow Fever Sites","Water St & Chestnut, Old City, PA",,,3:00 PM,"1793 epidemic exploitation"
"Eastern Star Weekend",Day 1,"Masonic Temple","1 N. Broad St, Philadelphia, PA",,,10:00 AM,"Private Eastern Star tour, jewels, robes"
"Eastern Star Weekend",Day 1,"SOUTH Kitchen & Jazz Club","600 N. Broad St, Philadelphia, PA",,,1:00 PM,"Award-winning jazz brunch"
"Eastern Star Weekend",Day 1,"Prince Hall Grand Lodge","4611 Lancaster Ave, Philadelphia, PA",,,3:00 PM,"1929 Egyptian Revival building"
"Eastern Star Weekend",Day 1,"Most Worshipful Prince Hall OES","Philadelphia, PA",,,,"Grand Chapter OES Temple"
"Eastern Star Weekend",Day 1,"Widow's Son Hall","3427 Germantown Ave, Philadelphia, PA",,,,"Early Black OES chapters home"
"Eastern Star Weekend",Day 1,"Relish","7152 Ogontz Ave, Philadelphia, PA",,,6:30 PM,"Upscale soul food in mansion"
"Eastern Star Weekend",Day 2,"Mother Bethel AME Church","419 S. 6th St, Philadelphia, PA",,,9:00 AM,"Eastern Star Sunday worship"
"Eastern Star Weekend",Day 2,"The Breakfast Den","1500 South St, Philadelphia, PA",,,11:30 AM,"Black-woman owned brunch spot"
"Eastern Star Weekend",Day 2,"Robert H. Johnson Chapter No. 5","Laurel Hill Cemetery, Philadelphia, PA",,,1:30 PM,"OES Memorial Marker"
"Eastern Star Weekend",Day 2,"Sweetbriar Mansion","Fairmount Park, Philadelphia, PA",,,,"Closing ceremony"
"Job's Daughters",Day 1,"Masonic Temple","1 N. Broad St, Philadelphia, PA",,,9:15 AM,"First Bethel tour - Egyptian Hall initiation site (1921)"
"Job's Daughters",Day 1,"Reading Terminal Market","12th & Arch St, Philadelphia, PA",,,12:30 PM,"Lunch with purple lemonade"
"Job's Daughters",Day 1,"Original Bethel No. 1 Hall","13th & Arch St, Philadelphia, PA",,,2:00 PM,"1921-1930s meeting hall site"
"Job's Daughters",Day 1,"Arch Street United Methodist","Arch St, Philadelphia, PA",,,,"Historical installation site"
"Job's Daughters",Day 1,"Free Quaker Meeting House","5th & Arch St, Philadelphia, PA",,,,"Job's daughters during Revolution lesson"
"Job's Daughters",Day 1,"Crystal Tea Room","Wanamaker Building 9th floor, Philadelphia, PA",,,6:00 PM,"Purple & White Gala Dinner"
"Job's Daughters",Day 2,"Christ Church","2nd & Market St, Philadelphia, PA",,,9:00 AM,"Bethel Worship Service"
"Job's Daughters",Day 2,"Green Eggs Café","1306 Dickinson St, Philadelphia, PA",,,10:45 AM,"Brunch with purple ube lattes"
"Job's Daughters",Day 2,"Sweetbriar Mansion","Fairmount Park, Philadelphia, PA",,,12:30 PM,"Closing ceremony with purple roses"
"Masonic Scavenger Hunt",,"Masonic Temple","1 N. Broad St, Philadelphia, PA",,,Start,"The Temple That Watched City Hall Rise"
"Masonic Scavenger Hunt",,"Prince Hall Grand Lodge","4611 Lancaster Ave, Philadelphia, PA",,,,"Prince Hall's 1920s Egyptian Fortress"
"Masonic Scavenger Hunt",,"Pennsylvania Hospital","8th & Spruce St, Philadelphia, PA",,,,"Hospital Gate With Oldest Masonic Mark"
"Masonic Scavenger Hunt",,"City Hall","Broad & Market St, Philadelphia, PA",,,,"Compass & Square on Penn's Hat"
"Black Architects Tour",Day 1,"Philadelphia Museum of Art","2600 Benjamin Franklin Parkway, PA",,,9:00 AM,"Julian Abele design (1916-1928)"
"Black Architects Tour",Day 1,"Free Library Central","1901 Vine St, Philadelphia, PA",,,10:30 AM,"Abele's grand staircase and rotunda (1917-1927)"
"Black Architects Tour",Day 1,"Penn Campus - Fisher Library","University of Pennsylvania, PA",,,1:30 PM,"Abele's Gothic masterpiece (1891/1911)"
"Black Architects Tour",Day 1,"Irvine Auditorium","University of Pennsylvania, PA",,,,"Abele's neo-Gothic concert hall (1925-1931)"
"Black Architects Tour",Day 1,"Union League","140 S. Broad St, Philadelphia, PA",,,3:30 PM,"Abele's Renaissance Revival additions (1909-1911)"
"Black Architects Tour",Day 2,"Berean Savings & Loan","5419 W. Girard Ave, Philadelphia, PA",,,9:30 AM,"Walter Livingston Jr. Brutalist design (1972)"
"Black Architects Tour",Day 2,"Zion Baptist Church","3600 N. Broad St, Philadelphia, PA",,,11:00 AM,"Livingston's 1970s modernist sanctuary"
"Black Architects Tour",Day 2,"African American Museum","701 Arch St, Philadelphia, PA",,,2:00 PM,"Theodore Cam Jr. design (1976)"
"Black Architects Tour",Day 2,"Progress Plaza","1501-1541 N. Broad St, Philadelphia, PA",,,3:30 PM,"Louis de Moll, first Black-owned shopping center (1968)"
"Black Architects Tour",Day 2,"Philadanco Building","1735 Market St, Philadelphia, PA",,,5:00 PM,"Joan Myers Brown, first Black woman major arts facility"
"SEPTA Broad Street Line",Part 1,"Shibe Park","1301 Edgley St, Philadelphia, PA",,,,"Negro Leagues Historic Site, Philadelphia Stars"
"SEPTA Broad Street Line",Part 1,"Olney Black History Markers","5th St & Olney Ave, Philadelphia, PA",,,,"Black WWII veterans plaques"
"SEPTA Broad Street Line",Part 1,"Hunting Park Centers","Hunting Park, Philadelphia, PA",,,,"Early Black mutual aid societies"
"SEPTA Broad Street Line",Part 1,"Wyoming Ave Business District","Wyoming Ave, Philadelphia, PA",,,,"1920s Black entrepreneurs corridor"
"SEPTA Broad Street Line",Part 1,"North Philly Black Metropolis","Susquehanna-Dauphin area, PA",,,,"Historic zone for Black commerce"
"SEPTA Broad Street Line",Part 1,"Erie Avenue Cultural Corridor","Erie Ave, Philadelphia, PA",,,,"1940s jazz clubs, Coltrane influence"
"SEPTA Broad Street Line",Part 2,"Cecil B. Moore Mural","North Philadelphia, PA",,,,"NAACP leader, voting rights"
"SEPTA Broad Street Line",Part 2,"Lehigh Black Labor Sites","Lehigh Ave, Philadelphia, PA",,,,"Factories where Black workers unionized"
"SEPTA Broad Street Line",Part 2,"Rockland Black Churches","Rockland area, Philadelphia, PA",,,,"AME-affiliated churches cluster"
"SEPTA Broad Street Line",Part 2,"Berks Street Arts District","Berks St, Philadelphia, PA",,,,"1950s Black poets and painters hub"
"SEPTA Broad Street Line",Part 2,"Divine Lorraine Hotel","Race-Vine area, Philadelphia, PA",,,,"Nation's first racially integrated hotel"
"SEPTA Broad Street Line",Part 3,"William Still Marker","City Hall area, Philadelphia, PA",,,,"Father of the Underground Railroad"
"SEPTA Broad Street Line",Part 3,"Julian Abele Sites","Walnut-Locust area, PA",,,,"First Black UPenn architect"
"SEPTA Broad Street Line",Part 3,"First African Baptist Church","Lombard-South area, PA",,,,"Key abolition site"
"SEPTA Broad Street Line",Part 3,"Aces Museum Black WWII Veterans","near NRG Station, Philadelphia, PA",,,,"Philly's Black troops artifacts"
"Philadelphia Foundations",Day 1,"Fair Hill Burial Ground","2901 Germantown Ave, Philadelphia, PA",,,Morning,"Quaker site (1703), Lucretia Mott, Robert Purvis"
"Philadelphia Foundations",Day 1,"Harriet Tubman Mural","2900 Germantown Ave, Philadelphia, PA",,,Morning,"AR overlay with coded signals"
"Philadelphia Foundations",Day 1,"Belmont Mansion","2000 Belmont Mansion Dr, Fairmount Park, PA",,,Afternoon,"1742 estate, Underground Railroad sanctuary"
"Philadelphia Foundations",Day 2,"Johnson House","6306 Germantown Ave, Philadelphia, PA",,,Morning,"Philly's only intact Underground Railroad station"
"Philadelphia Foundations",Day 2,"Ebenezer Maxwell Mansion","200 W Tulpehocken St, Philadelphia, PA",,,Afternoon,"Victorian abolition network hub"
"Philadelphia Foundations",Day 2,"Cliveden","6401 Germantown Ave, Philadelphia, PA",,,Afternoon,"Underground Railroad role"
"MOVE Bombing Memorial",,"Municipal Services Building","1401 JFK Blvd, Philadelphia, PA",,,9:00 AM,"Remembering MOVE exhibit, Commission testimonies"
"MOVE Bombing Memorial",,"Powelton Village","311 N. 33rd St, Philadelphia, PA",,,11:00 AM,"MOVE's first stronghold (1973-1978)"
"MOVE Bombing Memorial",,"Chef Curt's BBQ","near 62nd & Market St, Philadelphia, PA",,,12:00 PM,"Community lunch, owner stories"
"MOVE Bombing Memorial",,"Osage Avenue","6221 Osage Ave, Philadelphia, PA",,,2:00 PM,"Bomb site, 11 victims memorial"
"MOVE Bombing Memorial",,"Cobbs Creek Park","63rd & Vine Sts, Philadelphia, PA",,,3:30 PM,"Where firefighters let it burn"
"MOVE Bombing Memorial",,"African American Museum","701 Arch St, Philadelphia, PA",,,5:15 PM,"Medical Apartheid exhibit, healing panels"
"Philly Black Art Odyssey",Day 1,"African American Museum","701 Arch St, Philadelphia, PA",,,9:00 AM,"CCH Pounder collection, African diaspora art"
"Philly Black Art Odyssey",Day 1,"Philadelphia Museum of Art","2600 Benjamin Franklin Pkwy, PA",,,11:30 AM,"Time is Always Now - 60 works by 28 artists"
"Philly Black Art Odyssey",Day 1,"Barnes Foundation","2025 Benjamin Franklin Pkwy, PA",,,3:00 PM,"African masks, Mickalene Thomas exhibit"
"Philly Black Art Odyssey",Day 1,"Woodmere Art Museum","9201 Germantown Ave, PA",,,Evening,"We Speak exhibit - 70 works, 1920s-1970s"
"Philly Black Art Odyssey",Day 2,"Brandywine Workshop","1520 Sansom St, Philadelphia, PA",,,10:00 AM,"Elizabeth Catlett lithographs, prints"
"Philly Black Art Odyssey",Day 2,"October Gallery","2101 N Front St, Philadelphia, PA",,,11:30 AM,"Emerging Black artists, mixed media"
"Philly Black Art Odyssey",Day 2,"PA Academy Fine Arts","118-128 N Broad St, Philadelphia, PA",,,2:30 PM,"Kehinde Wiley, Nick Cave, Mickalene Thomas"
"Philly Black Art Odyssey",Day 2,"Moody Jones Gallery","107b S Easton Rd, Glenside, PA",,,5:00 PM,"New and emerging Black artists"
"Philly Black Art Odyssey",Day 3,"Mural Arts Tour","1729 Mt Vernon St start, Philadelphia, PA",,,9:00 AM,"Black Be Beautiful, Cecil B. Moore murals"
"Philly Black Art Odyssey",Day 3,"Public Sculptures","Various locations, Philadelphia, PA",,,2:30 PM,"Octavius Catto, Tuskegee Airmen, Keith Haring murals"
"College Hop Tour",Day 1,"University of Pennsylvania","Locust Walk, Philadelphia, PA",,,9:00 AM,"Ivy League campus, Fisher Library, College Hall"
"College Hop Tour",Day 1,"Drexel University","Market St, Philadelphia, PA",,,11:00 AM,"Mario the Dragon statue, Health Sciences Building"
"College Hop Tour",Day 1,"Thomas Jefferson University","East Falls, Philadelphia, PA",,,3:30 PM,"100-acre wooded campus, fashion studios"
"College Hop Tour",Day 2,"Temple University","North Philadelphia, PA",,,9:00 AM,"Bell Tower, Diamond Band, 30+ murals"
"College Hop Tour",Day 2,"La Salle University","Olney, Philadelphia, PA",,,11:30 AM,"1930s Collegiate Gothic, De La Salle chapel"
"College Hop Tour",Day 2,"Chestnut Hill College","Chestnut Hill, Philadelphia, PA",,,2:30 PM,"1920s castle campus on hill"
"College Hop Tour",Day 2,"Saint Joseph's University","City Ave, Philadelphia, PA",,,4:30 PM,"Hawk Hill, Barbelin Tower"
"College Hop Tour",Day 3,"University of the Arts","Broad Street, Philadelphia, PA",,,9:30 AM,"Terra Hall, dance/music rehearsals"
"College Hop Tour",Day 3,"Curtis Institute of Music","Rittenhouse Square, Philadelphia, PA",,,11:00 AM,"Free student recitals, world-class classical"
"College Hop Tour",Day 3,"Community College of Philly","Mint Building, Philadelphia, PA",,,1:00 PM,"Rooftop garden, Career & Tech Center"
"College Hop Tour",Day 3,"PA Academy of Fine Arts","Broad St, Philadelphia, PA",,,3:30 PM,"Historic cast collection, student galleries"
"Speakeasy Tour",,"The Ranstead Room","20 S. 2nd St, Philadelphia, PA",,,Noon,"#1 Classic - 1920s alley bootlegger site"
"Speakeasy Tour",,"Franklin Mortgage & Investment","1330 Walnut St, Philadelphia, PA",,,1:00 PM,"#2 Elite - USA TODAY top speakeasy"
"Speakeasy Tour",,"Hop Sing Laundromat","1029 Race St, Philadelphia, PA",,,2:00 PM,"#3 Iconic - World's 50 Best Bars, password entry"
"Speakeasy Tour",,"1 Tippling Place","2007 Chestnut St, Philadelphia, PA",,,3:00 PM,"#4 Craft - James Beard bartenders"
"Speakeasy Tour",,"The Library Bar","214 S 40th St, Philadelphia, PA",,,4:00 PM,"#5 Literary - Behind bookcase in Bar Hygge"
"Speakeasy Tour",,"Andra Hem","1333 S 2nd St, Philadelphia, PA",,,5:00 PM,"#6 Swedish - Nordic cocktails, hidden behind furniture"
"Speakeasy Tour",,"Haunt","1315 Sansom St, Philadelphia, PA",,,6:00 PM,"#7 Spooky - Gothic decor, 1800s morgue site"
"Speakeasy Tour",,"Charlie Was A Sinner","2201 Fairmount Ave, Philadelphia, PA",,,7:00 PM,"#8 Dramatic - Burlesque nights"
"Speakeasy Tour",,"Mask and Wig Club","309 S Quince St, Philadelphia, PA",,,8:00 PM,"#9 Collegiate - 1889 private club"
"Speakeasy Tour",,"Midnight & The Wicked","131 S 2nd St, Philadelphia, PA",,,9:00 PM,"#10 Jazz - Live jazz, 1920s glamour"`;

  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'founders_threads_tour_locations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Download Tour Locations CSV
          </h2>
          <p className="text-gray-600 mb-6">
            This CSV contains all tour locations from your PDF document, formatted for Google Maps import.
            It includes {csvData.split('\n').length - 1} locations across all tours.
          </p>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-indigo-900 mb-2">How to use with Google Maps:</h3>
            <ol className="text-sm text-indigo-800 space-y-1 list-decimal list-inside">
              <li>Download the CSV file below</li>
              <li>Go to Google My Maps (mymaps.google.com)</li>
              <li>Click "Create a New Map"</li>
              <li>Click "Import" and upload this CSV</li>
              <li>Google will automatically plot all locations on the map</li>
              <li>You can filter by tour name, create layers, and customize markers</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Tours Included:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <div>• Black American Legacy & Quaker Heritage (30 stops)</div>
              <div>• Rainbow Girls Philadelphia (10 stops)</div>
              <div>• Divine 9 Legacy Tour (8 stops)</div>
              <div>• Black American Sports (9 stops)</div>
              <div>• Black Inventors Tour (8 stops)</div>
              <div>• Library Story Hop (7 stops)</div>
              <div>• Old York Road Corridor (10 stops)</div>
              <div>• Black Medical Legacy (18 stops)</div>
              <div>• Eastern Star Weekend (10 stops)</div>
              <div>• Job's Daughters (9 stops)</div>
              <div>• Masonic Scavenger Hunt (4 stops)</div>
              <div>• Black Architects Tour (9 stops)</div>
              <div>• SEPTA Broad Street Line (14 stops)</div>
              <div>• Philadelphia Foundations (6 stops)</div>
              <div>• MOVE Bombing Memorial (6 stops)</div>
              <div>• Philly Black Art Odyssey (10 stops)</div>
              <div>• College Hop Tour (11 stops)</div>
              <div>• Speakeasy Tour (10 stops)</div>
            </div>
          </div>

          <Button
            onClick={downloadCSV}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download CSV for Google Maps
          </Button>
        </div>
      </div>
    </div>
  );
}