import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'plots' })
export class Plot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  extension: string;

  @Column({ type: 'int' })
  size: number;
}
