
import { supabase } from '@/integrations/supabase/client';
import seedData from '../data/seed.json';

// Function to import seed data into Supabase
export const importSeedData = async () => {
  try {
    // Check if data already exists
    const { data: existingSites, error: siteError } = await supabase
      .from('site')
      .select('id')
      .limit(1);
    
    if (siteError) throw siteError;
    
    // If we already have data, don't seed again
    if (existingSites && existingSites.length > 0) {
      console.log('Seed data already exists, skipping import');
      return false;
    }
    
    console.log('Importing seed data to Supabase...');
    
    // Import sites
    const { error: sitesError } = await supabase
      .from('site')
      .insert(seedData.sites);
    
    if (sitesError) throw sitesError;
    
    // Import meters
    const { error: metersError } = await supabase
      .from('meter')
      .insert(seedData.meters);
    
    if (metersError) throw metersError;
    
    // Import readings
    const { error: readingsError } = await supabase
      .from('reading')
      .insert(seedData.readings);
    
    if (readingsError) throw readingsError;
    
    // Import KPIs
    const { error: kpisError } = await supabase
      .from('kpi_daily')
      .insert(seedData.kpi_daily);
    
    if (kpisError) throw kpisError;
    
    // Import anomalies
    const { error: anomaliesError } = await supabase
      .from('anomaly')
      .insert(seedData.anomalies);
    
    if (anomaliesError) throw anomaliesError;
    
    console.log('Seed data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing seed data:', error);
    return false;
  }
};

// Function to check if we should import seed data
export const checkAndImportSeedData = async () => {
  const { data: existingSites } = await supabase
    .from('site')
    .select('id')
    .limit(1);
  
  if (!existingSites || existingSites.length === 0) {
    return importSeedData();
  }
  
  return false;
};
