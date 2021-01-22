import { TestComponent } from './test.component';

describe('TestComponent', () => {
  let component: TestComponent;

  beforeEach(() => {
    component = new TestComponent();
   });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
